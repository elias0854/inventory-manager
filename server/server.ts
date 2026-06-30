import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JWT_SECRET = process.env.JWT_SECRET || 'inv-manager-secret-2026';
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* Serve frontend in production */
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

/* ======== Database ======== */
const db = new Database(path.join(__dirname, 'inventory.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'operator',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT NOT NULL,
    category_id TEXT,
    unit TEXT DEFAULT '个',
    price REAL DEFAULT 0,
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 10,
    image_url TEXT DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS stock_logs (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    before_qty INTEGER NOT NULL,
    after_qty INTEGER NOT NULL,
    note TEXT DEFAULT '',
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

/* Demo data */
const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
if (userCount === 0) {
  const now = new Date().toISOString();
  const adminId = 'admin-001';
  const opId = 'op-001';
  db.prepare('INSERT INTO users VALUES (?,?,?,?,?)').run(adminId, 'admin', bcrypt.hashSync('admin123', 10), 'admin', now);
  db.prepare('INSERT INTO users VALUES (?,?,?,?,?)').run(opId, 'operator', bcrypt.hashSync('123456', 10), 'operator', now);
}

const catCount = db.prepare('SELECT COUNT(*) as c FROM categories').get().c;
if (catCount === 0) {
  const now = new Date().toISOString();
  const cats = [
    { id: 'cat-elec', name: '电子产品', created_at: now },
    { id: 'cat-office', name: '办公用品', created_at: now },
    { id: 'cat-daily', name: '日用品', created_at: now },
    { id: 'cat-food', name: '食品饮料', created_at: now },
  ];
  const ins = db.prepare('INSERT INTO categories VALUES (?,?,?)');
  for (const c of cats) ins.run(c.id, c.name, c.created_at);
}

const prodCount = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
if (prodCount === 0) {
  const now = new Date().toISOString();
  const prods = [
    ['prod-001', '无线鼠标', 'WM-001', 'cat-elec', '个', 89, 150, 20],
    ['prod-002', '机械键盘', 'MK-002', 'cat-elec', '个', 299, 80, 10],
    ['prod-003', 'USB-C 数据线', 'UC-003', 'cat-elec', '根', 25, 500, 50],
    ['prod-004', 'A4打印纸', 'PA-001', 'cat-office', '包', 22, 200, 30],
    ['prod-005', '黑色签字笔', 'BP-002', 'cat-office', '盒', 15, 8, 10],
    ['prod-006', '文件夹', 'FD-003', 'cat-office', '个', 5, 0, 20],
    ['prod-007', '洗手液', 'HS-001', 'cat-daily', '瓶', 12, 45, 10],
    ['prod-008', '矿泉水', 'MW-001', 'cat-food', '箱', 36, 120, 20],
  ];
  const ins = db.prepare('INSERT INTO products (id,name,sku,category_id,unit,price,stock,min_stock,image_url,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
  for (const p of prods) ins.run(p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], '', now, now);
}

/* ======== Middleware ======== */
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: '未登录' });
  try {
    req.user = jwt.verify(header.split(' ')[1], JWT_SECRET);
    next();
  } catch { return res.status(401).json({ error: '登录已过期' }); }
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: '需要管理员权限' });
  next();
}

function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

/* ======== Auth Routes ======== */
app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: '用户名和密码必填' });
  if (db.prepare('SELECT id FROM users WHERE username=?').get(username)) return res.status(400).json({ error: '用户名已存在' });
  const id = generateId();
  const now = new Date().toISOString();
  db.prepare('INSERT INTO users VALUES (?,?,?,?,?)').run(id, username, bcrypt.hashSync(password, 10), 'operator', now);
  const token = jwt.sign({ id, username, role: 'operator' }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id, username, role: 'operator' } });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username=?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: '用户名或密码错误' });
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id,username,role,created_at FROM users WHERE id=?').get(req.user.id);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  res.json(user);
});

/* ======== User Management (admin) ======== */
app.get('/api/users', authMiddleware, adminOnly, (req, res) => {
  const users = db.prepare('SELECT id,username,role,created_at FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

app.put('/api/users/:id', authMiddleware, adminOnly, (req, res) => {
  const { role, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(req.params.id);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  if (role && !['admin', 'operator'].includes(role)) return res.status(400).json({ error: '无效的角色' });
  if (role) db.prepare('UPDATE users SET role=? WHERE id=?').run(role, req.params.id);
  if (password) db.prepare('UPDATE users SET password=? WHERE id=?').run(bcrypt.hashSync(password, 10), req.params.id);
  res.json({ ok: true });
});

app.delete('/api/users/:id', authMiddleware, adminOnly, (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ error: '不能删除自己的账号' });
  db.prepare('DELETE FROM users WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

/* ======== Categories ======== */
app.get('/api/categories', authMiddleware, (req, res) => {
  const cats = db.prepare('SELECT * FROM categories ORDER BY created_at').all();
  const counts = db.prepare('SELECT category_id, COUNT(*) as count FROM products GROUP BY category_id').all();
  const countMap = Object.fromEntries(counts.map(c => [c.category_id, c.count]));
  res.json(cats.map(c => ({ ...c, productCount: countMap[c.id] || 0 })));
});

app.post('/api/categories', authMiddleware, adminOnly, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: '分类名称必填' });
  if (db.prepare('SELECT id FROM categories WHERE name=?').get(name)) return res.status(400).json({ error: '分类已存在' });
  const id = generateId();
  const now = new Date().toISOString();
  db.prepare('INSERT INTO categories VALUES (?,?,?)').run(id, name, now);
  res.json({ id, name, created_at: now, productCount: 0 });
});

app.put('/api/categories/:id', authMiddleware, adminOnly, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: '分类名称必填' });
  db.prepare('UPDATE categories SET name=? WHERE id=?').run(name, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/categories/:id', authMiddleware, adminOnly, (req, res) => {
  db.prepare('UPDATE products SET category_id=NULL WHERE category_id=?').run(req.params.id);
  db.prepare('DELETE FROM categories WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

/* ======== Products ======== */
app.get('/api/products', authMiddleware, (req, res) => {
  const { search, category_id, page, limit } = req.query;
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];
  if (search) { sql += ' AND (name LIKE ? OR sku LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  if (category_id && category_id !== 'all') { sql += ' AND category_id=?'; params.push(category_id); }
  sql += ' ORDER BY updated_at DESC';
  const total = db.prepare(sql.replace('SELECT *', 'SELECT COUNT(*) as c')).get(...params).c;
  const p = parseInt(page) || 1;
  const l = parseInt(limit) || 10;
  const rows = db.prepare(sql + ' LIMIT ? OFFSET ?').all(...params, l, (p - 1) * l);
  res.json({ data: rows, total, page: p, totalPages: Math.ceil(total / l) || 1 });
});

app.post('/api/products', authMiddleware, adminOnly, (req, res) => {
  const { name, sku, category_id, unit, price, min_stock } = req.body;
  if (!name || !sku) return res.status(400).json({ error: '名称和SKU必填' });
  const id = generateId();
  const now = new Date().toISOString();
  db.prepare('INSERT INTO products VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(
    id, name, sku, category_id || null, unit || '个', price || 0, 0, min_stock || 10, '', now, now
  );
  res.json(db.prepare('SELECT * FROM products WHERE id=?').get(id));
});

app.put('/api/products/:id', authMiddleware, adminOnly, (req, res) => {
  const { name, sku, category_id, unit, price, min_stock } = req.body;
  const now = new Date().toISOString();
  db.prepare('UPDATE products SET name=?,sku=?,category_id=?,unit=?,price=?,min_stock=?,updated_at=? WHERE id=?').run(
    name, sku, category_id || null, unit, price, min_stock, now, req.params.id
  );
  res.json({ ok: true });
});

app.delete('/api/products/:id', authMiddleware, adminOnly, (req, res) => {
  db.prepare('DELETE FROM products WHERE id=?').run(req.params.id);
  db.prepare('DELETE FROM stock_logs WHERE product_id=?').run(req.params.id);
  res.json({ ok: true });
});

app.post('/api/products/batch-delete', authMiddleware, adminOnly, (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: '请提供商品ID数组' });
  const del = db.prepare('DELETE FROM products WHERE id=?');
  const delLog = db.prepare('DELETE FROM stock_logs WHERE product_id=?');
  for (const id of ids) { del.run(id); delLog.run(id); }
  res.json({ ok: true, deleted: ids.length });
});

/* ======== Stock Operations ======== */
app.post('/api/stock/in', authMiddleware, (req, res) => {
  const { product_id, quantity, note } = req.body;
  if (!product_id || !quantity || quantity <= 0) return res.status(400).json({ error: '参数错误' });
  const product = db.prepare('SELECT * FROM products WHERE id=?').get(product_id);
  if (!product) return res.status(404).json({ error: '商品不存在' });
  const newStock = product.stock + quantity;
  db.prepare('UPDATE products SET stock=?,updated_at=? WHERE id=?').run(newStock, new Date().toISOString(), product_id);
  const logId = generateId();
  db.prepare('INSERT INTO stock_logs VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(
    logId, product_id, product.name, 'in', quantity, product.stock, newStock, note || '', req.user.id, req.user.username, new Date().toISOString()
  );
  res.json({ product: { ...product, stock: newStock }, log: db.prepare('SELECT * FROM stock_logs WHERE id=?').get(logId) });
});

app.post('/api/stock/out', authMiddleware, (req, res) => {
  const { product_id, quantity, note } = req.body;
  if (!product_id || !quantity || quantity <= 0) return res.status(400).json({ error: '参数错误' });
  const product = db.prepare('SELECT * FROM products WHERE id=?').get(product_id);
  if (!product) return res.status(404).json({ error: '商品不存在' });
  if (quantity > product.stock) return res.status(400).json({ error: '出库数量不能超过当前库存' });
  const newStock = product.stock - quantity;
  db.prepare('UPDATE products SET stock=?,updated_at=? WHERE id=?').run(newStock, new Date().toISOString(), product_id);
  const logId = generateId();
  db.prepare('INSERT INTO stock_logs VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(
    logId, product_id, product.name, 'out', quantity, product.stock, newStock, note || '', req.user.id, req.user.username, new Date().toISOString()
  );
  res.json({ product: { ...product, stock: newStock }, log: db.prepare('SELECT * FROM stock_logs WHERE id=?').get(logId) });
});

/* ======== Stock Logs ======== */
app.get('/api/logs', authMiddleware, (req, res) => {
  const { product_id, type, page, limit } = req.query;
  let sql = 'SELECT * FROM stock_logs WHERE 1=1';
  const params = [];
  if (product_id && product_id !== 'all') { sql += ' AND product_id=?'; params.push(product_id); }
  if (type && type !== 'all') { sql += ' AND type=?'; params.push(type); }
  sql += ' ORDER BY created_at DESC';
  const total = db.prepare(sql.replace('SELECT *', 'SELECT COUNT(*) as c')).get(...params).c;
  const p = parseInt(page) || 1;
  const l = parseInt(limit) || 50;
  const rows = db.prepare(sql + ' LIMIT ? OFFSET ?').all(...params, l, (p - 1) * l);
  res.json({ data: rows, total, page: p, totalPages: Math.ceil(total / l) || 1 });
});

/* ======== Dashboard Stats ======== */
app.get('/api/dashboard/stats', authMiddleware, (req, res) => {
  const products = db.prepare('SELECT * FROM products').all();
  const today = new Date().toISOString().slice(0, 10);
  const todayLogs = db.prepare("SELECT * FROM stock_logs WHERE created_at LIKE ?").all(today + '%');

  res.json({
    totalProducts: products.length,
    totalStock: products.reduce((s, p) => s + p.stock, 0),
    totalValue: products.reduce((s, p) => s + p.price * p.stock, 0),
    todayInCount: todayLogs.filter(l => l.type === 'in').reduce((s, l) => s + l.quantity, 0),
    todayOutCount: todayLogs.filter(l => l.type === 'out').reduce((s, l) => s + l.quantity, 0),
    lowStockCount: products.filter(p => p.stock > 0 && p.stock <= p.min_stock).length,
    outOfStockCount: products.filter(p => p.stock === 0).length,
    lowStockProducts: products.filter(p => p.stock <= p.min_stock),
    recentLogs: db.prepare('SELECT * FROM stock_logs ORDER BY created_at DESC LIMIT 6').all(),
  });
});

/* ======== Charts ======== */
app.get('/api/dashboard/chart/trend', authMiddleware, (req, res) => {
  const days = parseInt(req.query.days) || 7;
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const logs = db.prepare("SELECT * FROM stock_logs WHERE created_at LIKE ?").all(dateStr + '%');
    data.push({
      date: dateStr.slice(5),
      in: logs.filter(l => l.type === 'in').reduce((s, l) => s + l.quantity, 0),
      out: logs.filter(l => l.type === 'out').reduce((s, l) => s + l.quantity, 0),
    });
  }
  res.json(data);
});

app.get('/api/dashboard/chart/category', authMiddleware, (req, res) => {
  const cats = db.prepare('SELECT * FROM categories').all();
  const data = cats.map(c => {
    const prods = db.prepare('SELECT * FROM products WHERE category_id=?').all(c.id);
    return { name: c.name, count: prods.length, value: prods.reduce((s, p) => s + p.price * p.stock, 0) };
  });
  res.json(data);
});

/* ======== Stock Check (盘点) ======== */
app.post('/api/stock/check', authMiddleware, (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items)) return res.status(400).json({ error: '参数错误' });
  const results = [];
  for (const item of items) {
    const product = db.prepare('SELECT * FROM products WHERE id=?').get(item.product_id);
    if (!product) { results.push({ product_id: item.product_id, error: '商品不存在' }); continue; }
    const diff = item.actual - product.stock;
    results.push({ product_id: item.product_id, name: product.name, system: product.stock, actual: item.actual, diff });
    if (item.apply) {
      const newStock = item.actual;
      db.prepare('UPDATE products SET stock=?,updated_at=? WHERE id=?').run(newStock, new Date().toISOString(), item.product_id);
      const logId = generateId();
      db.prepare('INSERT INTO stock_logs VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(
        logId, item.product_id, product.name, diff >= 0 ? 'in' : 'out', Math.abs(diff), product.stock, newStock,
        `盘点修正: ${diff >= 0 ? '+' : ''}${diff}`, req.user.id, req.user.username, new Date().toISOString()
      );
    }
  }
  res.json(results);
});

/* ======== Image Upload ======== */
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname)),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith('image/')) });

app.post('/api/products/:id/image', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: '请上传图片' });
  const url = `/uploads/${req.file.filename}`;
  db.prepare('UPDATE products SET image_url=?,updated_at=? WHERE id=?').run(url, new Date().toISOString(), req.params.id);
  res.json({ url, product: db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id) });
});

/* ======== Start ======== */
app.listen(PORT, () => {
  console.log(`库存管家API已启动: http://localhost:${PORT}`);
});
