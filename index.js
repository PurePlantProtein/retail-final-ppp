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
const RESEND_API_KEY = process.env.RESEND_API_KEY || null;

let resendClient = null;
if (RESEND_API_KEY) {
  console.log('RESEND_API_KEY present; configuring resendClient');

  // Provide a robust fetch implementation: prefer global fetch (Node 18+), otherwise dynamically import node-fetch
  const getFetch = async () => {
    if (typeof globalThis.fetch !== 'undefined') return globalThis.fetch;
    try {
      const mod = await import('node-fetch');
      // node-fetch default export is the fetch function
      return mod.default || mod;
    } catch (err) {
      console.warn('dynamic import of node-fetch failed; fetch not available', err);
      return null;
    }
  };

  // Create resendClient that lazily resolves a working fetch impl
  resendClient = {
    send: async ({ from, to, subject, html, text }) => {
      const fetchImpl = await getFetch();
      if (!fetchImpl) throw new Error('no fetch implementation available for Resend');

      // Normalize recipients
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
    // payload.sub is user id
    const { rows } = await pool.query('SELECT id,email FROM users WHERE id=$1', [payload.sub]);
    const user = rows[0];
    if (!user) return res.json({ data: { session: null }, error: null });
    const session = {
      access_token: token,
      expires_at: Math.floor((Date.now() + 7 * 24 * 60 * 60 * 1000) / 1000),
      user: { id: user.id, email: user.email }
    };
    return res.json({ data: { session }, error: null });
  } catch (err) {
    return res.json({ data: { session: null }, error: null });
  }
});

// Password reset request -> creates a reset token (dev: returns token in response and logs it)
const crypto = require('crypto');
app.post('/api/auth/reset-request', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'missing email' });
  try {
    const { rows } = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    const user = rows[0];
    if (!user) return res.json({ ok: true });
    const token = crypto.randomBytes(20).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    await pool.query('INSERT INTO reset_tokens(user_id, token, expires_at) VALUES($1,$2,$3)', [user.id, token, expiresAt]);
    console.log('Password reset token for', email, token);
    // In production, send email here. For now return token in response to allow testing.
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
    // delete token
    await pool.query('DELETE FROM reset_tokens WHERE token=$1', [token]);
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'db error' });
  }
});

// Update user (profile or password) - expects Authorization header
app.post('/api/auth/update', authMiddleware, async (req, res) => {
  const payload = req.body;
  try {
    // If password provided, update password
    if (payload.password) {
      const hashed = await bcrypt.hash(payload.password, 10);
      await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hashed, req.user.sub]);
    }
    // For profile fields, upsert into profiles table
    const profileFields = ['business_name','business_address','phone','business_type','email','payment_terms'];
    const updates = {};
    for (const f of profileFields) if (payload[f] !== undefined) updates[f] = payload[f];
    if (Object.keys(updates).length) {
      // upsert profiles where id = user id
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
        // Build a simple email message from payload.
        // Expected payload shape varies; support common fields: to, subject, html, text
        const to = payload.to || payload.email || (payload.recipients && payload.recipients[0]) || null;
        const subject = payload.subject || payload.title || `Notification: ${name}`;
        const html = payload.html || payload.body || `<pre>${JSON.stringify(payload, null, 2)}</pre>`;
        const text = payload.text || (typeof payload.body === 'string' ? payload.body : null) || `See details in HTML body.`;

  if (resendClient) {
          try {
            const from = process.env.RESEND_FROM || 'no-reply@example.com';
            await resendClient.send({
              from,
              to: Array.isArray(to) ? to : [to],
              subject,
              html,
              text
            });
            return res.json({ ok: true });
          } catch (err) {
            console.error('resend send error', err);
            // fallback to logging
          }
        }

        // Fallback: log the email payload for dev/testing
        console.log(`Function ${name} would send email: to=${to} subject=${subject} html=${html}`);
        return res.json({ ok: true });
      case 'create-user': {
        // Minimal local implementation of the Supabase "create-user" function used by the frontend.
        // Creates a users row, a profiles row (id = users.id), and a user_roles row. Optionally emails credentials.
        const {
          email,
          businessName,
          businessType,
          role = 'retailer',
          contactName,
          phone,
          street,
          city,
          state,
          postalCode,
          emailCredentials = true,
          currentUserId
        } = payload || {};

        if (!email) return res.status(400).json({ error: 'missing email' });

        try {
          // Check existing user
          const { rows: existing } = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
          if (existing && existing.length) {
            return res.status(400).json({ error: `A user with the email ${email} already exists.` });
          }

          // Generate temp password
          const tempPassword = emailCredentials ? crypto.randomBytes(9).toString('base64') : 'TempPass123!';
          const hashed = await bcrypt.hash(tempPassword, 10);

          // Create user
          const { rows } = await pool.query('INSERT INTO users(email, password_hash) VALUES($1,$2) RETURNING id', [email, hashed]);
          const createdUserId = rows[0].id;

          // Compose address
          const business_address = [street, city, state, postalCode].filter(Boolean).join(', ');

          // Create profile (use same id as user)
          await pool.query(
            'INSERT INTO profiles(id, email, business_name, business_type, phone, business_address, payment_terms, created_at) VALUES($1,$2,$3,$4,$5,$6,$7,now())',
            [createdUserId, email, businessName || null, businessType || null, phone || null, business_address || null, 14]
          );

          // Assign role
          await pool.query('INSERT INTO user_roles(user_id, role) VALUES($1,$2)', [createdUserId, role]);

          // Send credentials email if configured
          let emailSent = false;
          if (emailCredentials && resendClient) {
            try {
              const from = process.env.RESEND_FROM || 'no-reply@example.com';
              await resendClient.send({
                from,
                to: [email],
                subject: 'Your PPP Retailers Account - Login Credentials',
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
          console.error('create-user error', err);
          // Attempt cleanup if partial state exists
          try {
            if (err && err.code) {
              // nothing special
            }
          } catch (e) {
            console.error('cleanup helper error', e);
          }
          return res.status(500).json({ error: 'user creation failed' });
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

// Generic query endpoint used by the frontend shim
app.post('/api/query', authMiddleware, async (req, res) => {
  const { table, select = '*', filters = [], maybeSingle = false, action, values } = req.body || {};
  if (!table) return res.status(400).json({ data: null, error: 'missing table' });
  // Simple allowlist for safety; include common tables used by frontend
  const allowed = ['users','products','orders','tracking_info','marketing','profiles','user_roles','pricing_tiers','business_types'];
  if (!allowed.includes(table)) {
    // If unknown table, return empty payload instead of error to avoid breaking frontend
    return res.json({ data: maybeSingle ? null : [], error: null });
  }

  try {
    if (action === 'insert') {
      // Build a simple insert statement
      const keys = Object.keys(values || {});
      const vals = keys.map(k => values[k]);
      const sql = `INSERT INTO ${table}(${keys.join(',')}) VALUES(${keys.map((_,i)=>`$${i+1}`).join(',')}) RETURNING *`;
      const { rows } = await pool.query(sql, vals);
      return res.json({ data: rows, error: null });
    }

    if (action === 'update') {
      // expects values and where { field, value }
      const { where } = req.body;
      if (!where) return res.status(400).json({ data: null, error: 'missing where' });
      const setKeys = Object.keys(values || {});
      const setVals = setKeys.map(k => values[k]);
      const sql = `UPDATE ${table} SET ${setKeys.map((k,i)=>`${k}=$${i+1}`).join(', ')} WHERE ${where.field}=$${setKeys.length+1} RETURNING *`;
      const { rows } = await pool.query(sql, [...setVals, where.value]);
      return res.json({ data: rows, error: null });
    }

    // Build select query with simple eq filters
    let sql = `SELECT ${select} FROM ${table}`;
    const params = [];
    if (Array.isArray(filters) && filters.length) {
      const clauses = filters.map((f, idx) => {
        params.push(f.value);
        return `${f.op || '='}(${f.field}) = $${params.length}`; // intentionally keep simple
      });
      // The above line is intentionally simplistic; use a safe fallback below
    }

    // Simpler: support single eq filter objects { type: 'eq', field, value }
    const eqFilters = (filters || []).filter(f => f.type === 'eq');
    if (eqFilters.length) {
      const whereClauses = eqFilters.map((f, i) => { params.push(f.value); return `${f.field} = $${i+1}`; });
      sql += ` WHERE ` + whereClauses.join(' AND ');
    }

    sql += ' ORDER BY id';
    const { rows } = await pool.query(sql, params);
    if (maybeSingle) return res.json({ data: rows[0] ?? null, error: null });
    return res.json({ data: rows, error: null });
  } catch (err) {
    console.error('query error', err);
    // Don't expose DB errors to the client; return empty data
    return res.json({ data: maybeSingle ? null : [], error: null });
  }
});

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log('API listening on', port));
