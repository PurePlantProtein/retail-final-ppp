require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const crypto = require('crypto');
const fs = require('fs');
const fsp = require('fs').promises; // For async file operations
const path = require('path');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@db:5432/postgres'
});

// Runtime lightweight migration: ensure products.updated_at exists (with time zone)
(async () => {
  try {
    const check = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='products' AND column_name='updated_at'");
    if (!check.rows.length) {
      console.log('[startup] adding products.updated_at TIMESTAMP WITH TIME ZONE');
      await pool.query('ALTER TABLE products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE');
      // Optionally backfill current time
      await pool.query("UPDATE products SET updated_at = now() WHERE updated_at IS NULL");
    }
  } catch (e) {
    console.error('[startup] failed ensuring products.updated_at', e.message);
  }

  // Ensure email_settings table exists (simple single-row log of latest settings)
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_settings (
        id SERIAL PRIMARY KEY,
        admin_email TEXT,
        dispatch_email TEXT,
        accounts_email TEXT,
        notify_admin BOOLEAN DEFAULT TRUE,
        notify_dispatch BOOLEAN DEFAULT FALSE,
        notify_accounts BOOLEAN DEFAULT FALSE,
        notify_customer BOOLEAN DEFAULT TRUE,
        customer_template TEXT,
        admin_template TEXT,
        dispatch_template TEXT,
        accounts_template TEXT,
        tracking_template TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
  } catch (e) {
    console.error('[startup] failed ensuring email_settings table', e.message);
  }

  // Ensure xero_tokens table exists
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS xero_tokens (
        id SERIAL PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `);
  } catch (e) {
    console.error('[startup] failed ensuring xero_tokens table', e.message);
  }
})();

// FIXED: Enforce a secure JWT_SECRET in production.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET === 'dev-secret') {
  console.error('FATAL ERROR: A secure JWT_SECRET environment variable must be set.');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

const RESEND_API_KEY = process.env.RESEND_API_KEY || null;

let resendClient = null;
if (RESEND_API_KEY) {
  console.log('RESEND_API_KEY present; configuring resendClient');

  const getFetch = async () => {
    if (typeof globalThis.fetch !== 'undefined') return globalThis.fetch;
    try {
      const mod = await import('node-fetch');
      return mod.default || mod;
    } catch (err) {
      console.warn('dynamic import of node-fetch failed; fetch not available', err);
      return null;
    }
  };

  resendClient = {
    send: async ({ from, to, subject, html, text }) => {
      const fetchImpl = await getFetch();
      if (!fetchImpl) throw new Error('no fetch implementation available for Resend');

      const recipients = Array.isArray(to) ? to : [to];
      const body = { from, to: recipients, subject, html };
      try {
        const resp = await fetchImpl('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`
          },
          body: JSON.stringify(body)
        });
        const textBody = await resp.text();
        let parsed = null;
        try { parsed = textBody ? JSON.parse(textBody) : null; } catch (e) { /* ignore */ }
        if (!resp.ok) {
          const err = new Error(`resend error ${resp.status}: ${textBody}`);
          err.status = resp.status;
          err.body = textBody;
          throw err;
        }
        console.log('resend send response', resp.status, parsed || textBody);
        return parsed || textBody;
      } catch (err) {
        console.error('resend send failed', err);
        throw err;
      }
    }
  };
}

// ---- Xero OAuth minimal scaffolding ----
const XERO_CLIENT_ID = process.env.XERO_CLIENT_ID || '';
const XERO_CLIENT_SECRET = process.env.XERO_CLIENT_SECRET || '';
const XERO_REDIRECT_URI = process.env.XERO_REDIRECT_URI || '';
const XERO_SCOPES = process.env.XERO_SCOPES || 'openid profile email accounting.transactions accounting.contacts offline_access';

function buildXeroAuthUrl(state) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: XERO_CLIENT_ID,
    redirect_uri: XERO_REDIRECT_URI,
    scope: XERO_SCOPES,
    state
  });
  return `https://login.xero.com/identity/connect/authorize?${params.toString()}`;
}

async function xeroTokenRequest(grant_type, payload) {
  const basic = Buffer.from(`${XERO_CLIENT_ID}:${XERO_CLIENT_SECRET}`).toString('base64');
  const params = new URLSearchParams({ grant_type, ...payload });
  const fetchImpl = (typeof globalThis.fetch !== 'undefined') ? globalThis.fetch : (await import('node-fetch')).default;
  const res = await fetchImpl('https://identity.xero.com/connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': `Basic ${basic}` },
    body: params.toString()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`xero token error: ${res.status} ${JSON.stringify(data)}`);
  return data;
}

async function xeroGetConnections(access_token) {
  const fetchImpl = (typeof globalThis.fetch !== 'undefined') ? globalThis.fetch : (await import('node-fetch')).default;
  const res = await fetchImpl('https://api.xero.com/connections', { headers: { Authorization: `Bearer ${access_token}` } });
  const data = await res.json();
  if (!res.ok) throw new Error(`xero connections error: ${res.status} ${JSON.stringify(data)}`);
  return data;
}

async function getActiveXeroToken() {
  const { rows } = await pool.query('SELECT * FROM xero_tokens ORDER BY updated_at DESC LIMIT 1');
  const rec = rows[0];
  if (!rec) return null;
  if (new Date(rec.expires_at) > new Date()) return rec;
  // refresh
  const token = await xeroTokenRequest('refresh_token', { refresh_token: rec.refresh_token });
  const expiresAt = new Date(Date.now() + (token.expires_in * 1000));
  const { rows: up } = await pool.query(
    'UPDATE xero_tokens SET access_token=$1, refresh_token=$2, expires_at=$3, updated_at=now() WHERE id=$4 RETURNING *',
    [token.access_token, token.refresh_token || rec.refresh_token, expiresAt.toISOString(), rec.id]
  );
  return up[0];
}

app.get('/api/xero/connect', authMiddleware, async (req, res) => {
  try {
    if (!(await isAdmin(req.user.sub))) return res.status(403).json({ error: 'forbidden' });
    const state = crypto.randomBytes(16).toString('hex');
    // Naive state store: echo in cookie for demo; in production, store in DB/user session.
    res.cookie && res.cookie('xero_oauth_state', state, { httpOnly: true, sameSite: 'lax' });
    return res.redirect(buildXeroAuthUrl(state));
  } catch (e) {
    console.error('xero connect failed', e);
    return res.status(500).json({ error: 'xero_connect_failed' });
  }
});

app.get('/api/xero/callback', async (req, res) => {
  try {
    const { code, state } = req.query || {};
    if (!code) return res.status(400).send('Missing code');
    const token = await xeroTokenRequest('authorization_code', { code, redirect_uri: XERO_REDIRECT_URI });
    const conns = await xeroGetConnections(token.access_token);
    const tenant = Array.isArray(conns) ? conns[0] : null;
    if (!tenant) return res.status(400).send('No Xero tenant connection found');
    const expiresAt = new Date(Date.now() + (token.expires_in * 1000));
    await pool.query(
      'INSERT INTO xero_tokens(tenant_id, access_token, refresh_token, expires_at, created_at, updated_at) VALUES($1,$2,$3,$4, now(), now())',
      [tenant.tenantId, token.access_token, token.refresh_token, expiresAt.toISOString()]
    );
    return res.send('Xero connected successfully. You can close this window.');
  } catch (e) {
    console.error('xero callback failed', e);
    return res.status(500).send('Xero connection failed');
  }
});

// Create Xero invoice for an order (admin-triggered)
app.post('/api/admin/orders/:id/xero-invoice', authMiddleware, async (req, res) => {
  try {
    if (!(await isAdmin(req.user.sub))) return res.status(403).json({ error: 'forbidden' });
    const id = req.params.id;
    const { rows } = await pool.query('SELECT * FROM orders WHERE id=$1 LIMIT 1', [id]);
    const order = rows[0];
    if (!order) return res.status(404).json({ error: 'not_found' });
    const token = await getActiveXeroToken();
    if (!token) return res.status(400).json({ error: 'xero_not_connected' });

    // Map order → Xero invoice payload (simplified, tax-exclusive)
    const shippingAddress = order.shipping_address ? JSON.parse(order.shipping_address) : null;
    const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || '[]');
    const defaultAccount = process.env.XERO_DEFAULT_ACCOUNT_CODE || '200';
    const shippingAccount = process.env.XERO_SHIPPING_ACCOUNT_CODE || defaultAccount;
    const taxCodeProducts = process.env.XERO_TAX_CODE_PRODUCTS || 'GST Free';
    const taxCodeShipping = process.env.XERO_TAX_CODE_SHIPPING || 'GST on Income';

    // Product lines (GST free) with ItemCode from SKU when available
    const lines = items.map((it) => ({
      Description: (it.product && it.product.name) || `Product ${it.product_id || ''}`,
      Quantity: Number(it.quantity) || 1,
      UnitAmount: Number(it.unit_price ?? it.product?.price ?? 0),
      AccountCode: defaultAccount,
      ItemCode: it.product?.sku || undefined,
      TaxType: taxCodeProducts
    }));

    // Add shipping line with GST if shipping_option has a price
    try {
      const shippingOpt = order.shipping_option ? (typeof order.shipping_option === 'string' ? JSON.parse(order.shipping_option) : order.shipping_option) : null;
      const shipPrice = shippingOpt && shippingOpt.price != null ? Number(shippingOpt.price) : null;
      if (shipPrice && shipPrice > 0) {
        lines.push({
          Description: `Shipping${shippingOpt?.name ? ` - ${shippingOpt.name}` : ''}`,
          Quantity: 1,
          UnitAmount: shipPrice,
          AccountCode: shippingAccount,
          TaxType: taxCodeShipping
        });
      }
    } catch (e) {
      console.warn('failed to parse shipping_option for Xero invoice', e.message);
    }
    const dueDays =  Number(order.payment_terms || 14);
    const today = new Date();
    const due = new Date(today.getTime() + dueDays*24*60*60*1000);
    const invoice = {
      Type: 'ACCREC',
      Contact: { Name: order.user_name, EmailAddress: order.email },
      Date: today.toISOString().substring(0,10),
      DueDate: due.toISOString().substring(0,10),
      Reference: String(order.id),
      Status: 'AUTHORISED',
      LineItems: lines,
      ...(process.env.XERO_BRANDING_THEME_ID ? { BrandingThemeID: process.env.XERO_BRANDING_THEME_ID } : {})
    };

    // POST to Xero Accounting API
    const fetchImpl = (typeof globalThis.fetch !== 'undefined') ? globalThis.fetch : (await import('node-fetch')).default;
    const resp = await fetchImpl(`https://api.xero.com/api.xro/2.0/Invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.access_token}`,
        'Xero-tenant-id': token.tenant_id
      },
      body: JSON.stringify({ Invoices: [invoice] })
    });
    const body = await resp.json();
    if (!resp.ok) {
      console.error('xero create invoice failed', body);
      return res.status(resp.status).json({ error: 'xero_error', details: body });
    }
    return res.json({ data: body, error: null });
  } catch (e) {
    console.error('create xero invoice error', e);
    return res.status(500).json({ error: 'xero_invoice_failed' });
  }
});

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

// Return session based on Authorization header
app.get('/api/auth/session', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.json({ data: { session: null }, error: null });
  const token = auth.replace(/Bearer\s*/, '');
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const { rows } = await pool.query('SELECT id,email FROM users WHERE id=$1', [payload.sub]);
    const user = rows[0];
    if (!user) return res.json({ data: { session: null }, error: null });
    const session = {
      access_token: token,
      expires_at: payload.exp, // Use the actual expiration from the token
      user: { id: user.id, email: user.email }
    };
    return res.json({ data: { session }, error: null });
  } catch (err) {
    return res.json({ data: { session: null }, error: null });
  }
});

// Password reset request
app.post('/api/auth/reset-request', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'missing email' });
  try {
    const { rows } = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    const user = rows[0];
    if (!user) return res.json({ ok: true }); // Don't reveal if user exists
    const token = crypto.randomBytes(20).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    await pool.query('INSERT INTO reset_tokens(user_id, token, expires_at) VALUES($1,$2,$3)', [user.id, token, expiresAt]);
    console.log('Password reset token for', email, token);
    return res.json({ ok: true, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'db error' });
  }
});

// Reset password using token
app.post('/api/auth/reset', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'missing token or password' });
  try {
    const { rows } = await pool.query('SELECT user_id,expires_at FROM reset_tokens WHERE token=$1', [token]);
    const rec = rows[0];
    if (!rec) return res.status(400).json({ error: 'invalid token' });
    if (new Date(rec.expires_at) < new Date()) return res.status(400).json({ error: 'token expired' });
    const hashed = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hashed, rec.user_id]);
    await pool.query('DELETE FROM reset_tokens WHERE token=$1', [token]);
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'db error' });
  }
});

// Update user (profile or password)
app.post('/api/auth/update', authMiddleware, async (req, res) => {
  const payload = req.body;
  try {
    if (payload.password) {
      const hashed = await bcrypt.hash(payload.password, 10);
      await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hashed, req.user.sub]);
    }
    // Accept camelCase aliases from clients and map to DB snake_case
    const mapped = { ...payload };
    if (mapped.businessName !== undefined && mapped.business_name === undefined) mapped.business_name = mapped.businessName;
    if (mapped.businessAddress !== undefined && mapped.business_address === undefined) mapped.business_address = mapped.businessAddress;
    if (mapped.contactPhone !== undefined && mapped.phone === undefined) mapped.phone = mapped.contactPhone;
    if (mapped.businessType !== undefined && mapped.business_type === undefined) mapped.business_type = mapped.businessType;
    if (mapped.paymentTerms !== undefined && mapped.payment_terms === undefined) mapped.payment_terms = mapped.paymentTerms;

    const profileFields = ['business_name','business_address','phone','business_type','email','payment_terms'];
    const updates = {};
    for (const f of profileFields) if (mapped[f] !== undefined) updates[f] = mapped[f];
    if (Object.keys(updates).length) {
      const keys = Object.keys(updates);
      const vals = keys.map(k => updates[k]);
      const setSql = keys.map((k, i) => `${k} = $${i+2}`).join(', ');
      const sql = `INSERT INTO profiles(id, ${keys.join(',')}) VALUES($1, ${keys.map((_,i)=>`$${i+2}`).join(',')}) ON CONFLICT (id) DO UPDATE SET ${setSql}`;
      await pool.query(sql, [req.user.sub, ...vals]);
    }
    return res.json({ data: null, error: null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'db error' });
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
    const { category } = req.query || {};
    const params = [];
    let sql = `
      SELECT p.*, json_build_object('id', c.id, 'name', c.name) AS product_categories
      FROM products p
      LEFT JOIN product_categories c ON p.category = c.id`;
    if (category) {
      params.push(String(category));
      sql += ` WHERE p.category = $1`;
    }
    sql += ` ORDER BY p.id`;
    const { rows } = await pool.query(sql, params);
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});

// Single product with joined category
app.get('/api/products/:id', authMiddleware, async (req, res) => {
  const id = req.params.id;
  try {
    const { rows } = await pool.query(`
      SELECT p.*, json_build_object('id', c.id, 'name', c.name) AS product_categories
      FROM products p
      LEFT JOIN product_categories c ON p.category = c.id
      WHERE p.id = $1
      LIMIT 1
    `, [id]);
    return res.json({ data: rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});

// Product Categories CRUD
app.get('/api/categories', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, created_at FROM product_categories ORDER BY name');
    return res.json({ data: rows, error: null });
  } catch (e) {
    console.error('categories list error', e);
    return res.status(500).json({ error: 'db error' });
  }
});

async function isAdmin(userId) {
  try {
    const { rows } = await pool.query('SELECT 1 FROM user_roles WHERE user_id=$1 AND role=$2', [userId, 'admin']);
    return rows.length > 0;
  } catch { return false; }
}

// Email settings API: returns the most recent row; write inserts a new row (immutable history)
app.get('/api/email-settings', authMiddleware, async (req, res) => {
  try {
    if (!(await isAdmin(req.user.sub))) return res.status(403).json({ error: 'forbidden' });
    const { rows } = await pool.query('SELECT * FROM email_settings ORDER BY created_at DESC LIMIT 1');
    return res.json({ data: rows[0] || null, error: null });
  } catch (e) {
    console.error('email-settings get error', e);
    return res.status(500).json({ error: 'db error' });
  }
});

app.post('/api/email-settings', authMiddleware, async (req, res) => {
  try {
    if (!(await isAdmin(req.user.sub))) return res.status(403).json({ error: 'forbidden' });
    const fields = [
      'admin_email','dispatch_email','accounts_email','notify_admin','notify_dispatch','notify_accounts','notify_customer',
      'customer_template','admin_template','dispatch_template','accounts_template','tracking_template'
    ];
    const body = req.body || {};
    const cols = fields.filter(f => body[f] !== undefined);
    const vals = cols.map((c, i) => body[c]);
    const placeholders = cols.map((_, i) => `$${i+1}`).join(', ');
    const sql = `INSERT INTO email_settings(${cols.join(', ')}) VALUES(${placeholders}) RETURNING *`;
    const { rows } = await pool.query(sql, vals);
    return res.json({ data: rows[0], error: null });
  } catch (e) {
    console.error('email-settings post error', e);
    return res.status(500).json({ error: 'db error' });
  }
});

app.post('/api/categories', authMiddleware, async (req, res) => {
  try {
    if (!(await isAdmin(req.user.sub))) return res.status(403).json({ error: 'forbidden' });
    const { name } = req.body || {};
    if (!name || !String(name).trim()) return res.status(400).json({ error: 'missing name' });
    const clean = String(name).trim();
    const { rows: existing } = await pool.query('SELECT id FROM product_categories WHERE LOWER(name)=LOWER($1) LIMIT 1', [clean]);
    if (existing.length) return res.status(409).json({ error: 'exists', id: existing[0].id });
    const { rows } = await pool.query('INSERT INTO product_categories(name, created_at) VALUES($1, now()) RETURNING id, name, created_at', [clean]);
    return res.json({ data: rows[0], error: null });
  } catch (e) {
    console.error('categories create error', e);
    return res.status(500).json({ error: 'db error' });
  }
});

app.put('/api/categories/:id', authMiddleware, async (req, res) => {
  try {
    if (!(await isAdmin(req.user.sub))) return res.status(403).json({ error: 'forbidden' });
    const id = req.params.id;
    const { name } = req.body || {};
    if (!name || !String(name).trim()) return res.status(400).json({ error: 'missing name' });
    const clean = String(name).trim();
    const { rows } = await pool.query('UPDATE product_categories SET name=$1 WHERE id=$2 RETURNING id, name, created_at', [clean, id]);
    return res.json({ data: rows[0] || null, error: null });
  } catch (e) {
    console.error('categories update error', e);
    return res.status(500).json({ error: 'db error' });
  }
});

app.delete('/api/categories/:id', authMiddleware, async (req, res) => {
  try {
    if (!(await isAdmin(req.user.sub))) return res.status(403).json({ error: 'forbidden' });
    const id = req.params.id;
    const { rows } = await pool.query('DELETE FROM product_categories WHERE id=$1 RETURNING id', [id]);
    return res.json({ data: rows[0] || null, error: null });
  } catch (e) {
    console.error('categories delete error', e);
    return res.status(500).json({ error: 'db error' });
  }
});

// Utility: normalize JSON-capable fields in product payload
function coerceProductJsonFields(obj) {
  const jsonKeys = ['amino_acid_profile','nutritional_info','metadata'];
  for (const k of jsonKeys) {
    if (obj[k] === undefined || obj[k] === null) continue;
    const v = obj[k];
    if (typeof v === 'string') {
      const s = v.trim();
      if (!s) { obj[k] = {}; continue; }
      try { obj[k] = JSON.parse(s); } catch { obj[k] = {}; }
    }
  }
  return obj;
}

// Utility: map alias keys from UI to actual DB columns for products
function mapProductAliases(obj) {
  const out = { ...obj };
  if (out.amino !== undefined && out.amino_acid_profile === undefined) {
    out.amino_acid_profile = out.amino; delete out.amino;
  }
  if (out.nutrients !== undefined && out.nutritional_info === undefined) {
    out.nutritional_info = out.nutrients; delete out.nutrients;
  }
  return out;
}

// Utility: accept camelCase keys from client and map to snake_case DB columns
function mapProductClientCamelToDb(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = { ...obj };
  const mapping = {
    aminoAcidProfile: 'amino_acid_profile',
    nutritionalInfo: 'nutritional_info',
    minQuantity: 'min_quantity',
    bagSize: 'bag_size',
    numberOfServings: 'number_of_servings',
    servingSize: 'serving_size',
    sku: 'sku',
  };
  for (const [from, to] of Object.entries(mapping)) {
    if (out[from] !== undefined && out[to] === undefined) {
      out[to] = out[from];
      delete out[from];
    }
  }
  return out;
}

// Utility: resolve category input to category id (creates if name string not found)
async function resolveCategoryId(cat) {
  if (cat === undefined || cat === null) return null;
  // If already a number or numeric string
  if (typeof cat === 'number' && Number.isFinite(cat)) return cat;
  if (typeof cat === 'string' && /^\d+$/.test(cat.trim())) return parseInt(cat.trim(), 10);
  if (typeof cat === 'string') {
    const name = cat.trim();
    if (!name) return null;
    const { rows } = await pool.query('SELECT id FROM product_categories WHERE LOWER(name)=LOWER($1) LIMIT 1', [name]);
    if (rows.length) return rows[0].id;
    const ins = await pool.query('INSERT INTO product_categories(name, created_at) VALUES($1, now()) RETURNING id', [name]);
    return ins.rows[0].id;
  }
  return null;
}

// Create product (dedicated endpoint)
app.post('/api/products', authMiddleware, async (req, res) => {
  try {
    const body = coerceProductJsonFields(mapProductClientCamelToDb({ ...(req.body || {}) }));
    // Coerce numeric fields from strings
    const num = (v) => (v === '' || v === null || v === undefined) ? null : (typeof v === 'string' ? Number(v) : v);
    const intNum = (v) => (v === '' || v === null || v === undefined) ? null : (typeof v === 'string' ? parseInt(v, 10) : v);
    if (body.price !== undefined) body.price = num(body.price) ?? 0;
    if (body.stock !== undefined) body.stock = intNum(body.stock) ?? 0;
    if (body.min_quantity !== undefined) body.min_quantity = intNum(body.min_quantity) ?? 1;
    if (body.number_of_servings !== undefined) body.number_of_servings = intNum(body.number_of_servings) ?? null;
    if (body.weight !== undefined) body.weight = num(body.weight);
    if (body.category === '') body.category = null;
    if (body.category !== undefined) {
      try { body.category = await resolveCategoryId(body.category); } catch (e) { /* ignore; will fail in insert if bad */ }
    }
    // Discover existing product columns
    const { rows: colRows } = await pool.query("SELECT column_name, is_nullable, data_type, column_default FROM information_schema.columns WHERE table_name='products'");
    const existing = new Set(colRows.map(r=>r.column_name));

    // Sanitize JSON fields defensively (in case UI sends non-JSON types)
    const ensureJson = (k, v) => {
      if (v === undefined || v === null) return v;
      const t = typeof v;
      if (t === 'object') return v; // arrays/objects fine
      if (t === 'string') {
        const s = v.trim();
        if (!s) return (k === 'amino_acid_profile' || k === 'nutritional_info') ? [] : {};
        try { return JSON.parse(s); } catch { return (k === 'amino_acid_profile' || k === 'nutritional_info') ? [] : {}; }
      }
      return (k === 'amino_acid_profile' || k === 'nutritional_info') ? [] : {};
    };
    for (const c of colRows) {
      if (/json/i.test(c.data_type) && body[c.column_name] !== undefined) {
        body[c.column_name] = ensureJson(c.column_name, body[c.column_name]);
      }
    }

    // Provide minimal sane defaults for NOT NULL columns without defaults
    const provideDefault = (dt) => {
      const t = String(dt || '').toLowerCase();
      if (/int|numeric|decimal|double|real/.test(t)) return 0;
      if (/json/.test(t)) return {};
      if (/bool/.test(t)) return false;
      if (/timestamp|date/.test(t)) return new Date();
      return '';
    };
    const provided = new Set(Object.keys(body));
    for (const c of colRows) {
      if (c.is_nullable === 'NO' && !c.column_default && !['id'].includes(c.column_name) && !provided.has(c.column_name)) {
        body[c.column_name] = provideDefault(c.data_type);
      }
    }

    // Build insert from intersection of known columns
    const keys = Object.keys(body).filter(k => existing.has(k));
    if (!keys.length) return res.status(400).json({ error: 'no_valid_columns' });
    // Serialize JSON columns to JSON strings for pg
    const jsonCols = new Set(colRows.filter(c => /json/i.test(c.data_type)).map(c => c.column_name));
    const vals = keys.map(k => jsonCols.has(k) ? JSON.stringify(body[k] ?? (k === 'amino_acid_profile' || k === 'nutritional_info' ? [] : {})) : body[k]);
    const placeholders = keys.map((_,i)=>`$${i+1}`).join(',');
    let sql = `INSERT INTO products(${keys.join(',')}) VALUES(${placeholders}) RETURNING *`;
    const { rows } = await pool.query(sql, vals);
    return res.json({ data: rows[0], error: null });
  } catch (err) {
    console.error('[products.create] failed', err);
    const dbg = process.env.DEBUG_ERRORS === 'true' ? { bodyKeys: Object.keys(req.body||{}), types: Object.fromEntries(Object.entries(req.body||{}).map(([k,v])=>[k, typeof v])) } : undefined;
    return res.status(400).json({ error: 'insert_failed', message: err.message, debug: dbg });
  }
});

// Update product (dedicated endpoint)
app.put('/api/products/:id', authMiddleware, async (req, res) => {
  const id = req.params.id;
  try {
    const body = coerceProductJsonFields(mapProductClientCamelToDb(mapProductAliases({ ...(req.body || {}) })));
    // Coerce numeric fields from strings
    const num = (v) => (v === '' || v === null || v === undefined) ? null : (typeof v === 'string' ? Number(v) : v);
    const intNum = (v) => (v === '' || v === null || v === undefined) ? null : (typeof v === 'string' ? parseInt(v, 10) : v);
    if (body.price !== undefined) body.price = num(body.price);
    if (body.stock !== undefined) body.stock = intNum(body.stock);
    if (body.min_quantity !== undefined) body.min_quantity = intNum(body.min_quantity);
    if (body.number_of_servings !== undefined) body.number_of_servings = intNum(body.number_of_servings);
    if (body.weight !== undefined) body.weight = num(body.weight);
    if (body.category === '') body.category = null;
    if (body.category !== undefined) {
      try { body.category = await resolveCategoryId(body.category); } catch (e) { /* ignore */ }
    }
    const { rows: colRows } = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='products'");
    const existing = new Set(colRows.map(r=>r.column_name));

    // Sanitize JSON fields defensively
    const ensureJson = (k, v) => {
      if (v === undefined || v === null) return v;
      const t = typeof v;
      if (t === 'object') return v;
      if (t === 'string') {
        const s = v.trim();
        if (!s) return (k === 'amino_acid_profile' || k === 'nutritional_info') ? [] : {};
        try { return JSON.parse(s); } catch { return (k === 'amino_acid_profile' || k === 'nutritional_info') ? [] : {}; }
      }
      return (k === 'amino_acid_profile' || k === 'nutritional_info') ? [] : {};
    };
    for (const c of colRows) {
      if (/json/i.test(c.data_type) && body[c.column_name] !== undefined) {
        body[c.column_name] = ensureJson(c.column_name, body[c.column_name]);
      }
    }
    const keys = Object.keys(body).filter(k => existing.has(k));
    if (!keys.length) return res.status(400).json({ error: 'no_valid_columns' });
    const assigns = keys.map((k,i)=>`${k}=$${i+1}`).join(', ');
    let sql = `UPDATE products SET ${assigns}`;
    if (existing.has('updated_at')) sql += ', updated_at=now()';
    sql += ` WHERE id=$${keys.length+1} RETURNING *`;
    const jsonCols = new Set(colRows.filter(c => /json/i.test(c.data_type)).map(c => c.column_name));
    const vals = keys.map(k => jsonCols.has(k) ? JSON.stringify(body[k] ?? (k === 'amino_acid_profile' || k === 'nutritional_info' ? [] : {})) : body[k]);
    const { rows } = await pool.query(sql, [...vals, id]);
    return res.json({ data: rows[0], error: null });
  } catch (err) {
    console.error('[products.update] failed', err);
    const dbg = process.env.DEBUG_ERRORS === 'true' ? {
      bodyKeys: Object.keys(req.body||{}),
      types: Object.fromEntries(Object.entries(req.body||{}).map(([k,v])=>[k, typeof v])),
      assignedKeys: (()=>{ try { const b = mapProductClientCamelToDb(mapProductAliases({ ...(req.body||{}) })); return Object.keys(b); } catch { return []; }})(),
      hint: 'Ensure json fields are objects/arrays (not plain strings). Fields: amino_acid_profile, nutritional_info, metadata.'
    } : undefined;
    return res.status(400).json({ error: 'update_failed', message: err.message, debug: dbg });
  }
});

// Delete product (dedicated endpoint) and attempt to clean up local image
app.delete('/api/products/:id', authMiddleware, async (req, res) => {
  const id = req.params.id;
  try {
    // Fetch image path before delete
    const { rows: pre } = await pool.query('SELECT image FROM products WHERE id=$1', [id]);
    const img = pre[0]?.image || '';
    const { rows } = await pool.query('DELETE FROM products WHERE id=$1 RETURNING id', [id]);
    const deleted = rows[0]?.id ? true : false;
    // Best-effort cleanup of local product image
    if (deleted && typeof img === 'string' && img.startsWith('/api/storage/product_images/')) {
      const filename = img.split('/').pop();
      if (filename && !filename.includes('..') && !filename.includes('/')) {
        const filePath = path.join(productImagesDir, filename);
        try { if (fs.existsSync(filePath)) await fsp.unlink(filePath); } catch {}
      }
    }
    return res.json({ ok: true, deleted });
  } catch (err) {
    console.error('[products.delete] failed', err);
    return res.status(500).json({ error: 'delete_failed', message: err.message });
  }
});

// Debug: products schema
app.get('/api/debug/products-schema', authMiddleware, async (req, res) => {
  try {
    // basic admin check
    const { rows: roles } = await pool.query('SELECT 1 FROM user_roles WHERE user_id=$1 AND role=$2', [req.user.sub, 'admin']);
    if (!roles.length) return res.status(403).json({ error: 'forbidden' });
    const { rows } = await pool.query("SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name='products' ORDER BY ordinal_position");
    return res.json({ data: rows });
  } catch (e) {
    return res.status(500).json({ error: 'schema_fetch_failed', message: e.message });
  }
});

// Debug: products constraints, indexes, triggers
app.get('/api/debug/products-constraints', authMiddleware, async (req, res) => {
  try {
    const { rows: roles } = await pool.query('SELECT 1 FROM user_roles WHERE user_id=$1 AND role=$2', [req.user.sub, 'admin']);
    if (!roles.length) return res.status(403).json({ error: 'forbidden' });
    const constraintSQL = `
      SELECT c.conname AS name, pg_get_constraintdef(c.oid) AS definition, c.contype
      FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      WHERE t.relname = 'products';
    `;
    const indexSQL = `
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'products';
    `;
    const triggersSQL = `
      SELECT trigger_name, event_manipulation, action_statement
      FROM information_schema.triggers
      WHERE event_object_table = 'products';
    `;
    const [constraints, indexes, triggers] = await Promise.all([
      pool.query(constraintSQL),
      pool.query(indexSQL),
      pool.query(triggersSQL)
    ]);
    res.json({ data: { constraints: constraints.rows, indexes: indexes.rows, triggers: triggers.rows } });
  } catch (e) {
    res.status(500).json({ error: 'constraints_fetch_failed', message: e.message });
  }
});

// Debug: self-test insert into products
app.post('/api/debug/products-selftest', authMiddleware, async (req, res) => {
  try {
    const base = {
      name: 'SELFTEST-' + Date.now(),
      description: 'diagnostic insert',
      price: 0,
      stock: 0,
      min_quantity: 1,
      category: 'Diagnostics',
      metadata: {}
    };
    const payload = coerceProductJsonFields({ ...base, ...(req.body || {}) });
    // Attempt direct insert reusing the same logic
    const { rows: colRows } = await pool.query("SELECT column_name, is_nullable, data_type, column_default FROM information_schema.columns WHERE table_name='products'");
    const existing = new Set(colRows.map(r=>r.column_name));
    const provided = new Set(Object.keys(payload));
    const provideDefault = (dt) => {
      const t = String(dt || '').toLowerCase();
      if (/int|numeric|decimal|double|real/.test(t)) return 0;
      if (/json/.test(t)) return {};
      if (/bool/.test(t)) return false;
      if (/timestamp|date/.test(t)) return new Date();
      return '';
    };
    for (const c of colRows) {
      if (c.is_nullable === 'NO' && !c.column_default && !['id'].includes(c.column_name) && !provided.has(c.column_name)) {
        payload[c.column_name] = provideDefault(c.data_type);
      }
    }
    const keys = Object.keys(payload).filter(k => existing.has(k));
    const vals = keys.map(k => payload[k]);
    const placeholders = keys.map((_,i)=>`$${i+1}`).join(',');
    const sql = `INSERT INTO products(${keys.join(',')}) VALUES(${placeholders}) RETURNING *`;
    try {
      const { rows } = await pool.query(sql, vals);
      return res.json({ ok: true, id: rows[0]?.id, usedColumns: keys });
    } catch (e) {
      return res.status(400).json({ ok: false, error: e.message, code: e.code, sql, keys, types: Object.fromEntries(keys.map((k,i)=>[k, typeof vals[i]])) });
    }
  } catch (e) {
    return res.status(500).json({ error: 'selftest_failed', message: e.message });
  }
});

// Admin metrics: summarized orders for analytics (filtered)
app.get('/api/admin/metrics/orders', authMiddleware, async (req, res) => {
  try {
    if (!(await isAdmin(req.user.sub))) return res.status(403).json({ error: 'forbidden' });
    const { include_admin, include_samples, days } = req.query || {};
    const params = [];
    let where = [];
    if (!include_samples || String(include_samples).toLowerCase() !== 'true') {
      where.push('o.is_sample IS NOT TRUE');
    }
    if (!include_admin || String(include_admin).toLowerCase() !== 'true') {
      // Heuristic: admin-created orders have id starting with 'ADMIN-'
      where.push("o.id NOT LIKE 'ADMIN-%'");
    }
    if (days && /^\d+$/.test(String(days))) {
      where.push('o.created_at >= now() - ($1::int * interval \'1 day\')');
      params.push(Number(days));
    }
    const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const sql = `SELECT o.id, o.created_at, o.updated_at, o.total, o.status, o.items, o.is_sample
                 FROM orders o
                 ${whereSql}`;
    const { rows } = await pool.query(sql, params);
    // Basic aggregation
    let totalRevenue = 0;
    let statusCounts = {};
    let byDate = {};
    for (const r of rows) {
      const t = Number(r.total) || 0;
      totalRevenue += t;
      statusCounts[r.status || 'unknown'] = (statusCounts[r.status || 'unknown'] || 0) + 1;
      const d = new Date(r.created_at).toISOString().substring(0,10);
      byDate[d] = (byDate[d] || 0) + 1;
    }
    return res.json({
      data: {
        orders: rows,
        aggregates: {
          count: rows.length,
            totalRevenue,
            averageOrderValue: rows.length ? totalRevenue / rows.length : 0,
            statusCounts,
            ordersByDate: byDate
        }
      },
      error: null
    });
  } catch (e) {
    console.error('metrics orders failed', e);
    return res.status(500).json({ error: 'metrics_failed' });
  }
});

// Endpoint to create orders (robust create with generated ID and JSON serialization)
app.post('/api/orders', authMiddleware, async (req, res) => {
  try {
    const payload = req.body || {};
    const {
      id: providedId,
      items: rawItems = [],
      total: rawTotal,
      user_id = req.user?.sub || null,
      user_name = null,
      email = null,
      status = 'pending',
      payment_method = null,
      shipping_address: rawShippingAddress = null,
      shipping_option: rawShippingOption = null,
      invoice_status = null,
      invoice_url = null,
      notes = null,
      is_sample = false
    } = payload;

    const tryParse = (v) => {
      if (v == null) return null;
      if (typeof v === 'string') {
        const s = v.trim();
        if (!s) return null;
        try { return JSON.parse(s); } catch { return v; }
      }
      return v;
    };

    const items = Array.isArray(rawItems) ? rawItems : (Array.isArray(tryParse(rawItems)) ? tryParse(rawItems) : []);
    const shipping_address = tryParse(rawShippingAddress);
    const shipping_option = tryParse(rawShippingOption);

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items_required' });
    }

    // Compute total if not provided
    const safeNum = (v) => {
      if (v === null || v === undefined || v === '') return 0;
      const n = typeof v === 'string' ? Number(v) : v;
      return Number.isFinite(n) ? n : 0;
    };
    let computed = 0;
    try {
      computed = items.reduce((acc, it) => acc + safeNum(it.unit_price ?? it.price ?? it.product?.price) * safeNum(it.quantity ?? 1), 0);
    } catch {}
    const total = rawTotal != null ? safeNum(rawTotal) : computed;

    const orderId = providedId && String(providedId).trim() ? String(providedId).trim() : `ORDER-${Date.now()}`;

    const sql = `INSERT INTO orders(
      id, user_id, user_name, email, items, total, status, payment_method,
      shipping_address, shipping_option, invoice_status, invoice_url, notes,
      created_at, updated_at, is_sample
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, now(), now(), $14
    ) RETURNING *`;
    const vals = [
      orderId,
      user_id || null,
      user_name || null,
      email || null,
      JSON.stringify(items),
      total,
      status,
      payment_method,
      shipping_address ? JSON.stringify(shipping_address) : null,
      shipping_option ? JSON.stringify(shipping_option) : null,
      invoice_status,
      invoice_url,
      notes,
      !!is_sample
    ];

    const { rows } = await pool.query(sql, vals);
    return res.json({ data: rows[0], error: null });
  } catch (err) {
    console.error('orders.create error', err);
    return res.status(500).json({ error: 'create_failed', message: err.message });
  }
});

// Admin: create order with manual pricing and shipping
app.post('/api/admin/orders', authMiddleware, async (req, res) => {
  try {
    if (!(await isAdmin(req.user.sub))) return res.status(403).json({ error: 'forbidden' });
    const {
      user: u = {},
      items = [],
      shipping_price = 0,
      shipping_address = null,
      shipping_option = null,
      notes = '',
      payment_method = 'manual',
      status = 'pending'
    } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'items_required' });
    const lineTotal = items.reduce((acc, it) => acc + Number(it.unit_price ?? 0) * Number(it.quantity ?? 0), 0);
    const total = Number(lineTotal) + Number(shipping_price || 0);

    // Generate an order id if not provided by client: ADMIN-<timestamp>
    const orderId = `ADMIN-${Date.now()}`;

    const { rows } = await pool.query(
      `INSERT INTO orders(id, user_id, user_name, email, items, total, status, payment_method, shipping_address, shipping_option, notes, created_at, updated_at)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, now(), now())
       RETURNING *`,
      [
        orderId,
        u.id || null,
        u.name || null,
        u.email || null,
        JSON.stringify(items),
        total,
        status,
        payment_method,
        shipping_address ? JSON.stringify(shipping_address) : null,
        shipping_option ? JSON.stringify(shipping_option) : null,
        notes || ''
      ]
    );
    return res.json({ data: rows[0], error: null });
  } catch (err) {
    console.error('admin create order error', err);
    return res.status(500).json({ error: 'create_failed', message: err.message });
  }
});

// Admin: update order including items; send notification emails when updated manually
app.put('/api/admin/orders/:id', authMiddleware, async (req, res) => {
  try {
    if (!(await isAdmin(req.user.sub))) return res.status(403).json({ error: 'forbidden' });
    const id = req.params.id;
    const {
      user_name, email, status, payment_method, invoice_status, invoice_url,
      notes, items, shipping_address, shipping_option, total
    } = req.body || {};

    // Normalize JSON-capable fields
    const tryJson = (v) => {
      if (v == null) return null;
      if (typeof v === 'string') { try { return JSON.parse(v); } catch { return v; } }
      return v;
    };
    const upd = {
      user_name: user_name ?? null,
      email: email ?? null,
      status: status ?? null,
      payment_method: payment_method ?? null,
      invoice_status: invoice_status ?? null,
      invoice_url: invoice_url ?? null,
      notes: notes ?? null,
      items: items != null ? JSON.stringify(items) : null,
      shipping_address: shipping_address != null ? JSON.stringify(tryJson(shipping_address)) : null,
      shipping_option: shipping_option != null ? JSON.stringify(tryJson(shipping_option)) : null,
      total: total != null ? Number(total) : null
    };
    const keys = Object.keys(upd).filter(k => upd[k] !== null);
    if (!keys.length) return res.status(400).json({ error: 'no_fields_to_update' });
    const assigns = keys.map((k,i)=>`${k}=$${i+1}`).join(', ');
    const vals = keys.map(k => upd[k]);
    const sql = `UPDATE orders SET ${assigns}, updated_at=now() WHERE id=$${keys.length+1} RETURNING *`;
    const { rows } = await pool.query(sql, [...vals, id]);
    const row = rows[0];

    // Send notifications
    let email_sent = false;
    try {
      // Load latest email settings
      let settings = null;
      try {
        const { rows: es } = await pool.query('SELECT * FROM email_settings ORDER BY created_at DESC LIMIT 1');
        settings = es[0] || null;
      } catch (e) {
        console.warn('email-settings read failed', e.message);
      }

      // Determine recipients
      const toList = [];
      const accounts = (settings?.accounts_email || process.env.ACCOUNTS_EMAIL || '').trim();
      const sales = (settings?.admin_email || process.env.SALES_EMAIL || '').trim();
      const dispatch = (settings?.dispatch_email || process.env.ORDERS_EMAIL || '').trim();
      const notifyAccounts = settings ? !!settings.notify_accounts : true;
      const notifyAdmin = settings ? !!settings.notify_admin : true;
      const notifyDispatch = settings ? !!settings.notify_dispatch : true;
      const notifyCustomer = settings ? !!settings.notify_customer : true;
      if (notifyAccounts && accounts) toList.push(accounts);
      if (notifyAdmin && sales) toList.push(sales);
      if (notifyDispatch && dispatch) toList.push(dispatch);
      if (notifyCustomer && row?.email) toList.push(row.email);

      if (!RESEND_API_KEY) console.warn('RESEND_API_KEY not set; skipping email send');
      if (!resendClient) console.warn('resendClient not configured; skipping email send');
      if (!toList.length) console.warn('No recipients configured for admin order update');

      if (resendClient && toList.length) {
        const from = process.env.RESEND_FROM || 'no-reply@example.com';
        const subject = `Order ${id} updated (${row.status || ''})`;
        const html = `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:14px;">
          <p>Order <strong>${id}</strong> was manually updated by an admin.</p>
          <table style="border-collapse:collapse;font-size:13px;">
            <tr><td style="padding:4px 8px;color:#6b7280;">Status:</td><td style="padding:4px 8px;">${row.status || ''}</td></tr>
            <tr><td style="padding:4px 8px;color:#6b7280;">Total:</td><td style="padding:4px 8px;">${row.total != null ? row.total : ''}</td></tr>
            <tr><td style="padding:4px 8px;color:#6b7280;">Payment:</td><td style="padding:4px 8px;">${row.payment_method || ''}</td></tr>
          </table>
          <p style="color:#6b7280;">View details in the admin portal.</p>
        </div>`;
        await resendClient.send({ from, to: toList, subject, html, text: `Order ${id} updated. Status=${row.status} Total=${row.total}` });
        email_sent = true;
      }
    } catch (e) {
      console.error('update order email failed', e);
    }

    return res.json({ data: row, email_sent });
  } catch (err) {
    console.error('admin update order error', err);
    return res.status(500).json({ error: 'update_failed', message: err.message });
  }
});

// Admin: save tracking info for an order
app.post('/api/orders/:id/tracking', authMiddleware, async (req, res) => {
  try {
    if (!(await isAdmin(req.user.sub))) return res.status(403).json({ error: 'forbidden' });
    const orderId = req.params.id;
    const { tracking_number, carrier, tracking_url, shipped_date, estimated_delivery_date } = req.body || {};
    // Upsert tracking info
    const { rows: existing } = await pool.query('SELECT id FROM tracking_info WHERE order_id=$1 LIMIT 1', [orderId]);

    // Try to derive tracking URL when carrier + number provided if tracking_url missing
    let derivedUrl = tracking_url || null;
    if (!derivedUrl && carrier && tracking_number) {
      const c = String(carrier).toLowerCase();
      if (c.includes('aus') || c.includes('australia')) derivedUrl = `https://auspost.com.au/mypost/track/#/details/${encodeURIComponent(tracking_number)}`;
      if (!derivedUrl && c.includes('star')) derivedUrl = `https://track.startrack.com.au/${encodeURIComponent(tracking_number)}`;
    }

    let row;
    if (existing.length) {
      const { rows: up } = await pool.query(
        `UPDATE tracking_info SET tracking_number=$1, carrier=$2, tracking_url=$3, shipped_date=$4, estimated_delivery_date=$5, updated_at=now()
         WHERE order_id=$6 RETURNING *`,
        [tracking_number || null, carrier || null, derivedUrl, shipped_date || null, estimated_delivery_date || null, orderId]
      );
      row = up[0];
    } else {
      const { rows: ins } = await pool.query(
        `INSERT INTO tracking_info(order_id, tracking_number, carrier, tracking_url, shipped_date, estimated_delivery_date, created_at, updated_at)
         VALUES($1,$2,$3,$4,$5,$6, now(), now()) RETURNING *`,
        [orderId, tracking_number || null, carrier || null, derivedUrl, shipped_date || null, estimated_delivery_date || null]
      );
      row = ins[0];
    }

    // Optionally send tracking email via resendClient
    let email_sent = false;
    if (resendClient) {
      try {
        const { rows: o } = await pool.query('SELECT email FROM orders WHERE id=$1', [orderId]);
        const to = o[0]?.email || null;
        if (to) {
          const from = process.env.RESEND_FROM || 'no-reply@example.com';
          const subject = 'Your order has shipped';
          const html = `<p>Your order <strong>${orderId}</strong> has shipped.</p>
                        ${row.tracking_number ? `<p>Tracking number: <strong>${row.tracking_number}</strong></p>` : ''}
                        ${row.tracking_url ? `<p>Track here: <a href="${row.tracking_url}">${row.tracking_url}</a></p>` : ''}`;
          await resendClient.send({ from, to: [to], subject, html, text: `Order ${orderId} shipped. Tracking: ${row.tracking_number || ''} ${row.tracking_url || ''}` });
          email_sent = true;
        }
      } catch (e) { console.error('send tracking email failed', e); }
    }

    return res.json({ data: row, email_sent });
  } catch (err) {
    console.error('save tracking error', err);
    return res.status(500).json({ error: 'tracking_failed', message: err.message });
  }
});

// Supabase-like function invocations
app.post('/api/functions/:name', authMiddleware, async (req, res) => {
  const name = req.params.name;
  const payload = (req.body && req.body.body) ? req.body.body : (req.body || {});
  console.log('invoke function', name, payload);
  try {
    switch (name) {
      case 'send-order-email':
      case 'send-tracking-email':
      case 'send-user-notification':
      case 'send-bulk-order-email':
        const to = payload.to || payload.email || (payload.recipients && payload.recipients[0]) || null;
        const subject = payload.subject || payload.title || `Notification: ${name}`;
        const html = payload.html || payload.body || `<pre>${JSON.stringify(payload, null, 2)}</pre>`;
        const text = payload.text || (typeof payload.body === 'string' ? payload.body : null) || `See details in HTML body.`;

        if (resendClient) {
          try {
            const from = process.env.RESEND_FROM || 'no-reply@example.com';
            await resendClient.send({
              from, to: Array.isArray(to) ? to : [to], subject, html, text
            });
            return res.json({ ok: true });
          } catch (err) {
            console.error('resend send error', err);
          }
        }
        console.log(`Function ${name} would send email: to=${to} subject=${subject} html=${html}`);
        return res.json({ ok: true });

      case 'create-user': {
        const { email, businessName, businessType, role = 'retailer', contactName, phone, street, city, state, postalCode, emailCredentials = true } = payload || {};
        if (!email) return res.status(400).json({ error: 'missing email' });
        
        // FIXED: Wrap user creation in a database transaction for data integrity.
        const client = await pool.connect();
        try {
          await client.query('BEGIN');

          const { rows: existing } = await client.query('SELECT id FROM users WHERE email=$1', [email]);
          if (existing && existing.length) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: `A user with the email ${email} already exists.` });
          }
          
          const tempPassword = emailCredentials ? crypto.randomBytes(9).toString('base64') : 'TempPass123!';
          const hashed = await bcrypt.hash(tempPassword, 10);
          
          const { rows } = await client.query('INSERT INTO users(email, password_hash) VALUES($1,$2) RETURNING id', [email, hashed]);
          const createdUserId = rows[0].id;

          const business_address = [street, city, state, postalCode].filter(Boolean).join(', ');
          
          await client.query(
            'INSERT INTO profiles(id, email, business_name, business_type, phone, business_address, payment_terms, created_at) VALUES($1,$2,$3,$4,$5,$6,$7,now())',
            [createdUserId, email, businessName || null, businessType || null, phone || null, business_address || null, 14]
          );

          await client.query('INSERT INTO user_roles(user_id, role) VALUES($1,$2)', [createdUserId, role]);

          await client.query('COMMIT');
          
          let emailSent = false;
          if (emailCredentials && resendClient) {
            try {
              const from = process.env.RESEND_FROM || 'no-reply@example.com';
              await resendClient.send({
                from, to: [email], subject: 'Your PPP Retailers Account - Login Credentials',
                html: `<p>Hello ${contactName || ''},</p><p>Your account has been created. Temporary password: <strong>${tempPassword}</strong></p>`,
                text: `Your temporary password: ${tempPassword}`
              });
              emailSent = true;
            } catch (err) {
              console.error('Failed to send credentials email:', err);
            }
          }
          return res.json({ success: true, message: `${businessName || email} has been added and approved.`, emailSent });
        } catch (err) {
          await client.query('ROLLBACK');
          console.error('create-user error', err);
          return res.status(500).json({ error: 'user creation failed' });
        } finally {
          client.release();
        }
      }
      default:
        return res.status(404).json({ error: 'function not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'function error' });
  }
});

// Storage endpoints
const storageDir = process.env.STORAGE_DIR || path.join(__dirname, '..', 'storage');
if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });
const upload = multer({ dest: storageDir });
const productImagesDir = path.join(storageDir, 'product_images');
if (!fs.existsSync(productImagesDir)) fs.mkdirSync(productImagesDir, { recursive: true });
// New generic site assets directory (for login background, hero images, etc.)
const assetsDir = path.join(storageDir, 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

app.post('/api/storage/marketing/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'no file uploaded' });

    // FIXED: Path Traversal vulnerability. Generate a safe filename instead of using the user-provided one.
    const safeFilename = `${crypto.randomUUID()}${path.extname(file.originalname)}`;
    const dest = path.join(storageDir, safeFilename);

    // FIXED: Use asynchronous rename to avoid blocking the event loop.
    await fsp.rename(file.path, dest);
    
    // Persist the safe filename to the database
    await pool.query('INSERT INTO marketing(path) VALUES($1)', [safeFilename]);
    res.json({ ok: true, path: safeFilename });
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({ error: 'file upload failed' });
  }
});

app.get('/api/storage/marketing/:file', async (req, res) => {
  const file = req.params.file;
  // Basic sanitization to prevent path traversal on download
  if (file.includes('..') || file.includes('/')) {
    return res.status(400).json({ error: 'invalid filename' });
  }
  const filePath = path.join(storageDir, file);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'not found' });
  res.sendFile(filePath);
});

// Product images upload (expects multipart/form-data with field 'file')
app.post('/api/storage/product_images/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'no file uploaded' });
    // Basic mime check
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      try { await fsp.unlink(file.path); } catch {}
      return res.status(400).json({ error: 'invalid file type' });
    }

    const safeFilename = `${crypto.randomUUID()}${path.extname(file.originalname || '')}`;
    const dest = path.join(productImagesDir, safeFilename);
    await fsp.rename(file.path, dest);
    const url = `/api/storage/product_images/${safeFilename}`;
    return res.json({ ok: true, url, filename: safeFilename });
  } catch (err) {
    console.error('product_images upload error:', err);
    return res.status(500).json({ error: 'file upload failed' });
  }
});

// Serve product images
app.get('/api/storage/product_images/:file', async (req, res) => {
  const file = req.params.file;
  if (file.includes('..') || file.includes('/')) {
    return res.status(400).json({ error: 'invalid filename' });
  }
  const filePath = path.join(productImagesDir, file);
  if (!fs.existsSync(filePath)) {
    // Gracefully redirect to placeholder to avoid noisy 404s in UI
    return res.redirect(302, '/placeholder.svg');
  }
  res.sendFile(filePath);
});

// --- Site Assets APIs ---
// Helper to sanitize a provided base key for filenames
function sanitizeKey(key) {
  return String(key || '')
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Upload a site asset (admin only). Accepts multipart 'file' and optional 'path' as a stable key.
app.post('/api/storage/assets/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!(await isAdmin(req.user.sub))) return res.status(403).json({ error: 'forbidden' });
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'no file uploaded' });
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      try { await fsp.unlink(file.path); } catch {}
      return res.status(400).json({ error: 'invalid file type' });
    }

    // Optional key provided as 'path' (to align with frontend supabase shim)
    const providedKey = sanitizeKey((req.body && req.body.path) || '');
    const ext = path.extname(file.originalname || '').toLowerCase() || '.png';

    let finalName;
    if (providedKey) {
      // Remove any existing files for this key (any extension)
      try {
        const entries = await fsp.readdir(assetsDir);
        await Promise.all(entries
          .filter(n => n.startsWith(providedKey + '.'))
          .map(n => fsp.unlink(path.join(assetsDir, n)).catch(() => {}))
        );
      } catch {}
      finalName = `${providedKey}${ext}`;
    } else {
      finalName = `${crypto.randomUUID()}${ext}`;
    }

    const dest = path.join(assetsDir, finalName);
    await fsp.rename(file.path, dest);
    const url = `/api/storage/assets/${finalName}`;
    return res.json({ ok: true, name: finalName, url, key: providedKey || null });
  } catch (err) {
    console.error('assets upload error:', err);
    return res.status(500).json({ error: 'file upload failed' });
  }
});

// Public get for assets. Supports either exact filename with extension or base key without extension.
app.get('/api/storage/assets/:name', async (req, res) => {
  const name = req.params.name;
  if (name.includes('..') || name.includes('/')) {
    return res.status(400).json({ error: 'invalid filename' });
  }
  let chosen = null;
  const exactPath = path.join(assetsDir, name);
  if (fs.existsSync(exactPath)) {
    chosen = exactPath;
  } else {
    // Try resolving by base name without extension
    const base = name.replace(/\.[^/.]+$/, '');
    try {
      const entries = await fsp.readdir(assetsDir);
      const match = entries.find(n => n.startsWith(base + '.'));
      if (match) chosen = path.join(assetsDir, match);
    } catch {}
  }
  if (!chosen || !fs.existsSync(chosen)) {
    return res.redirect(302, '/placeholder.svg');
  }
  return res.sendFile(chosen);
});

// List assets (admin only)
app.get('/api/storage/assets', authMiddleware, async (req, res) => {
  try {
    if (!(await isAdmin(req.user.sub))) return res.status(403).json({ error: 'forbidden' });
    const entries = await fsp.readdir(assetsDir, { withFileTypes: true });
    const files = await Promise.all(entries.filter(e => e.isFile()).map(async (e) => {
      const p = path.join(assetsDir, e.name);
      const st = await fsp.stat(p);
      return { name: e.name, size: st.size, mtime: st.mtime, url: `/api/storage/assets/${e.name}` };
    }));
    // Sort by mtime desc
    files.sort((a, b) => +new Date(b.mtime) - +new Date(a.mtime));
    return res.json({ data: files, error: null });
  } catch (err) {
    console.error('assets list error', err);
    return res.status(500).json({ error: 'list_failed' });
  }
});

// Delete asset (admin only). Accepts name with or without extension; deletes matching file(s).
app.delete('/api/storage/assets/:name', authMiddleware, async (req, res) => {
  try {
    if (!(await isAdmin(req.user.sub))) return res.status(403).json({ error: 'forbidden' });
    const name = req.params.name;
    if (name.includes('..') || name.includes('/')) return res.status(400).json({ error: 'invalid filename' });
    const exact = path.join(assetsDir, name);
    let deleted = 0;
    if (fs.existsSync(exact)) {
      try { await fsp.unlink(exact); deleted++; } catch {}
    } else {
      const base = name.replace(/\.[^/.]+$/, '');
      try {
        const entries = await fsp.readdir(assetsDir);
        const matches = entries.filter(n => n.startsWith(base + '.'));
        await Promise.all(matches.map(n => fsp.unlink(path.join(assetsDir, n)).then(()=>{deleted++;}).catch(()=>{})));
      } catch {}
    }
    return res.json({ ok: true, deleted });
  } catch (err) {
    console.error('assets delete error', err);
    return res.status(500).json({ error: 'delete_failed' });
  }
});

// Generic query endpoint used by the frontend shim
app.post('/api/query', authMiddleware, async (req, res) => {
  const { table, select = '*', filters = [], maybeSingle = false, action, values } = req.body || {};
  if (!table) return res.status(400).json({ data: null, error: 'missing table' });

  const allowed = ['users','products','orders','tracking_info','marketing','profiles','user_roles','pricing_tiers','business_types','product_categories'];
  if (!allowed.includes(table)) {
    return res.json({ data: maybeSingle ? null : [], error: null });
  }

  // SECURITY WARNING: For a production app, you should implement column-level whitelisting
  // for insert/update actions to prevent users from modifying sensitive columns.
  
  try {
    // Normalize values: for 'products' table, map/normalize; accept arrays for inserts
    let normValues = values;
    if (action === 'insert' || action === 'update') {
      if (table === 'products') {
        if (Array.isArray(values)) {
          normValues = values.map(v => coerceProductJsonFields(mapProductClientCamelToDb(mapProductAliases({ ...(v || {}) }))));
        } else if (values && typeof values === 'object') {
          normValues = coerceProductJsonFields(mapProductClientCamelToDb(mapProductAliases({ ...values })));
        } else {
          return res.status(400).json({ data: null, error: 'invalid values shape' });
        }
      } else {
        if (Array.isArray(values)) {
          normValues = values.map(v => ({ ...(v || {}) }));
        } else if (values && typeof values === 'object') {
          normValues = { ...values };
        } else {
          return res.status(400).json({ data: null, error: 'invalid values shape' });
        }
      }
    }
    if (action === 'insert') {
      if (Array.isArray(normValues)) {
        const results = [];
        for (const row of normValues) {
          const keys = Object.keys(row || {});
          if (!keys.length) continue;
          // Serialize JSON for products/orders tables
          const jsonCols = table === 'products'
            ? new Set(['amino_acid_profile','nutritional_info','metadata'])
            : table === 'orders'
              ? new Set(['items','shipping_address','shipping_option'])
              : new Set();
          const vals = keys.map(k => {
            if (jsonCols.has(k)) {
              const v = row[k];
              if (typeof v === 'string') {
                try { return JSON.stringify(JSON.parse(v)); } catch { return JSON.stringify(k === 'items' ? [] : {}); }
              }
              return JSON.stringify(v ?? (k === 'items' ? [] : {}));
            }
            if (table === 'orders' && k === 'total') {
              const n = typeof row[k] === 'string' ? Number(row[k]) : row[k];
              return Number.isFinite(n) ? n : 0;
            }
            return row[k];
          });
          const sql = `INSERT INTO ${table}(${keys.join(',')}) VALUES(${keys.map((_,i)=>`$${i+1}`).join(',')}) RETURNING *`;
          const { rows } = await pool.query(sql, vals);
          results.push(...rows);
        }
        return res.json({ data: maybeSingle ? (results[0] ?? null) : results, error: null });
      } else {
        const keys = Object.keys(normValues || {});
        const jsonCols = table === 'products'
          ? new Set(['amino_acid_profile','nutritional_info','metadata'])
          : table === 'orders'
            ? new Set(['items','shipping_address','shipping_option'])
            : new Set();
        const vals = keys.map(k => {
          if (jsonCols.has(k)) {
            const v = normValues[k];
            if (table === 'orders') {
              if (v === undefined || v === null || v === '') return null;
              if (typeof v === 'string') { try { return JSON.stringify(JSON.parse(v)); } catch { return null; } }
              return JSON.stringify(v);
            }
            const isArrayJson = (k === 'amino_acid_profile' || k === 'nutritional_info');
            if (v === undefined || v === null || v === '') return JSON.stringify(isArrayJson ? [] : {});
            if (typeof v === 'string') { try { return JSON.stringify(JSON.parse(v)); } catch { return JSON.stringify(isArrayJson ? [] : {}); } }
            return JSON.stringify(v);
          }
          if (table === 'orders' && k === 'total') {
            const vv = normValues[k];
            const n = typeof vv === 'string' ? Number(vv) : vv;
            return Number.isFinite(n) ? n : 0;
          }
          return normValues[k];
        });
        const sql = `INSERT INTO ${table}(${keys.join(',')}) VALUES(${keys.map((_,i)=>`$${i+1}`).join(',')}) RETURNING *`;
        const { rows } = await pool.query(sql, vals);
        return res.json({ data: maybeSingle ? (rows[0] ?? null) : rows, error: null });
      }
    }

    if (action === 'update') {
      const { where } = req.body;
      if (!where) return res.status(400).json({ data: null, error: 'missing where' });
      const setKeys = Object.keys(normValues || {});
      const jsonCols = table === 'products'
        ? new Set(['amino_acid_profile','nutritional_info','metadata'])
        : table === 'orders'
          ? new Set(['items','shipping_address','shipping_option'])
          : new Set();
      const setVals = setKeys.map(k => {
        if (jsonCols.has(k)) {
          const v = normValues[k];
          if (typeof v === 'string') {
            try { return JSON.stringify(JSON.parse(v)); } catch { return JSON.stringify(k === 'items' ? [] : {}); }
          }
          return JSON.stringify(v ?? (k === 'items' ? [] : {}));
        }
        if (table === 'orders' && k === 'total') {
          const vv = normValues[k];
          const n = typeof vv === 'string' ? Number(vv) : vv;
          return Number.isFinite(n) ? n : 0;
        }
        return normValues[k];
      });
      const sql = `UPDATE ${table} SET ${setKeys.map((k,i)=>`${k}=$${i+1}`).join(', ')} WHERE ${where.field}=$${setKeys.length+1} RETURNING *`;
      const { rows } = await pool.query(sql, [...setVals, where.value]);
      return res.json({ data: maybeSingle ? (rows[0] ?? null) : rows, error: null });
    }

    if (action === 'delete') {
      const { where } = req.body;
      if (!where) return res.status(400).json({ data: null, error: 'missing where' });
      const sql = `DELETE FROM ${table} WHERE ${where.field}=$1 RETURNING *`;
      const { rows } = await pool.query(sql, [where.value]);
      return res.json({ data: rows, error: null });
    }

    // FIXED: SQL Injection vulnerability. Do not allow arbitrary user input in the SELECT clause.
    // The 'select' variable from the request body is now ignored for security.
    const params = [];
    let sql;
    if (table === 'products') {
      sql = `SELECT p.*, json_build_object('id', c.id, 'name', c.name) AS product_categories
             FROM products p LEFT JOIN product_categories c ON p.category = c.id`;
      const eqFilters = (filters || []).filter(f => f.type === 'eq');
      if (eqFilters.length) {
        const whereClauses = eqFilters.map((f, i) => { params.push(f.value); return `p.${f.field} = $${i+1}`; });
        sql += ` WHERE ` + whereClauses.join(' AND ');
      }
      sql += ' ORDER BY p.id';
    } else {
      sql = `SELECT * FROM ${table}`;
      const eqFilters = (filters || []).filter(f => f.type === 'eq');
      if (eqFilters.length) {
        const whereClauses = eqFilters.map((f, i) => { params.push(f.value); return `${f.field} = $${i+1}`; });
        sql += ` WHERE ` + whereClauses.join(' AND ');
      }
      sql += ' ORDER BY id';
    }
    const { rows } = await pool.query(sql, params);
    if (maybeSingle) return res.json({ data: rows[0] ?? null, error: null });
    return res.json({ data: rows, error: null });
  } catch (err) {
    console.error('query error', err);
    return res.json({ data: maybeSingle ? null : [], error: 'Query failed' });
  }
});

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log('API listening on', port));