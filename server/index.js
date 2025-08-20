require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@db:5432/postgres'
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Simple signup route
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
  const hashed = await bcrypt.hash(password, 10);
  try {
    const { rows } = await pool.query('INSERT INTO users(email, password_hash) VALUES($1,$2) RETURNING id,email', [email, hashed]);
    const user = rows[0];
    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});

// Simple signin route
app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
  try {
    const { rows } = await pool.query('SELECT id,email,password_hash FROM users WHERE email=$1', [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: user.id, email: user.email }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});

// Middleware to verify token
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.replace(/Bearer\s*/, '');
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Example endpoint used by frontend to fetch products
app.get('/api/products', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY id');
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});

// Endpoint to create orders
app.post('/api/orders', authMiddleware, async (req, res) => {
  const { items, total } = req.body;
  try {
    const { rows } = await pool.query('INSERT INTO orders(user_id, items, total) VALUES($1,$2,$3) RETURNING id', [req.user.sub, JSON.stringify(items), total]);
    res.json({ id: rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});

// Supabase-like function invocations
app.post('/api/functions/:name', authMiddleware, async (req, res) => {
  const name = req.params.name;
  const payload = req.body;
  console.log('invoke function', name, payload);
  try {
    switch (name) {
      case 'send-order-email':
      case 'send-tracking-email':
      case 'send-user-notification':
      case 'send-bulk-order-email':
        // For now just log and return success; integrate with an email provider later
        console.log(`Function ${name} payload:`, payload);
        return res.json({ ok: true });
      default:
        return res.status(404).json({ error: 'function not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'function error' });
  }
});

// Storage endpoints (minimal): upload marketing files and list
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const storageDir = path.join(__dirname, '..', 'storage');
if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });
const upload = multer({ dest: storageDir });

app.post('/api/storage/marketing/upload', authMiddleware, upload.single('file'), async (req, res) => {
  // move file to a readable name
  const file = req.file;
  const dest = path.join(storageDir, file.originalname);
  fs.renameSync(file.path, dest);
  // persist a record
  await pool.query('INSERT INTO marketing(path) VALUES($1)', [file.originalname]);
  res.json({ ok: true, path: file.originalname });
});

app.get('/api/storage/marketing/:file', async (req, res) => {
  const file = req.params.file;
  const filePath = path.join(storageDir, file);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'not found' });
  res.sendFile(filePath);
});

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log('API listening on', port));
