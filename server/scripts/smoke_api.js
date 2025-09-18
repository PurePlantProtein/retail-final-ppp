#!/usr/bin/env node
/*
  Simple smoke test for the API:
  - Sign up a new user
  - Create a product
  - Create an order
  Usage:
    API_BASE="http://localhost:4000/api" node scripts/smoke_api.js
*/
(async () => {
  const API = process.env.API_BASE || 'http://localhost:4000/api';
  const fetchImpl = (typeof fetch !== 'undefined') ? fetch : (await import('node-fetch')).default;

  function log(step, data) {
    console.log(`SMOKE: ${step}`, data || '');
  }

  async function request(method, path, body, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetchImpl(`${API}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    let text = await res.text();
    let json = null; try { json = text ? JSON.parse(text) : null; } catch {}
    if (!res.ok) {
      const msg = json?.error || json?.message || res.statusText;
      throw new Error(`${method} ${path} failed: ${res.status} ${msg}`);
    }
    return json;
  }

  try {
    // 1) Sign up a user
    const email = `smoke+${Date.now()}@example.com`;
    const password = 'Test1234!';
    const signup = await request('POST', '/auth/signup', { email, password });
    const token = signup?.token;
    if (!token) throw new Error('No token returned from signup');
    log('signup ok', { email });

    // 2) Create a product
    const prodPayload = {
      name: 'SMOKE TEST PRODUCT',
      description: 'Created by smoke test',
      price: 9.99,
      stock: 5,
      min_quantity: 1,
      category: 'Diagnostics',
      amino_acid_profile: [],
      nutritional_info: [],
      metadata: { source: 'smoke' }
    };
    const prodRes = await request('POST', '/products', prodPayload, token);
    const product = prodRes?.data;
    if (!product?.id) throw new Error('Product create returned no id');
    log('product created', { id: product.id });

    // 3) Create an order
    const orderPayload = {
      items: [
        { product: { id: product.id, price: product.price, name: product.name }, quantity: 2, unit_price: product.price }
      ],
      total: (Number(product.price) || 0) * 2,
      status: 'pending',
      payment_method: 'manual',
      shipping_address: { name: 'Smoke Tester', street: '123 Test St', city: 'Testville', state: 'NSW', postalCode: '2000', country: 'AU' },
      shipping_option: { id: 'free-shipping', name: 'Free Shipping', price: 0, carrier: 'Australia Post' },
      notes: 'Smoke test order'
    };
    const orderRes = await request('POST', '/orders', orderPayload, token);
    const order = orderRes?.data;
    if (!order?.id) throw new Error('Order create returned no id');
    log('order created', { id: order.id });

    console.log('SMOKE TEST OK');
    process.exit(0);
  } catch (err) {
    console.error('SMOKE TEST FAILED:', err.message);
    process.exit(1);
  }
})();
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const crypto = require('crypto');

const API = process.env.API_BASE || 'http://localhost:4000/api';

async function main() {
  const email = `tester+${Date.now()}@example.com`;
  const password = 'Test1234!';
  console.log('Signing up new user:', email);
  let token = null;
  {
    const res = await fetch(`${API}/auth/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const body = await res.json();
    if (!res.ok) throw new Error('signup failed: ' + JSON.stringify(body));
    token = body.token;
  }
  console.log('Signed up. Token length:', token?.length);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  console.log('Creating product...');
  const prodPayload = {
    name: 'SMOKE TEST PRODUCT',
    description: 'Inserted by smoke test',
    price: 12.5,
    stock: 10,
    minQuantity: 1,
    bagSize: '1kg',
    numberOfServings: 20,
    servingSize: '50g',
    category: 'Diagnostics',
    aminoAcidProfile: [{ name: 'Leucine', amount: '2.5g' }],
    nutritionalInfo: [{ name: 'Protein', perServing: '21g', per100g: '42g' }]
  };
  let product = null;
  {
    const res = await fetch(`${API}/products`, { method: 'POST', headers, body: JSON.stringify(prodPayload) });
    const body = await res.json();
    if (!res.ok || body.error) throw new Error('create product failed: ' + JSON.stringify(body));
    product = body.data;
  }
  console.log('Product created with id:', product.id);

  console.log('Creating order...');
  const orderId = 'SMOKE-' + Date.now();
  const items = [{ product, quantity: 2, unit_price: product.price }];
  let order = null;
  {
    const res = await fetch(`${API}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ id: orderId, items, total: items[0].unit_price * items[0].quantity, status: 'pending', payment_method: 'manual' })
    });
    const body = await res.json();
    if (!res.ok || body.error) throw new Error('create order failed: ' + JSON.stringify(body));
    order = body.data;
  }
  console.log('Order created with id:', order.id, 'total:', order.total);

  console.log('Fetching orders list...');
  {
    const res = await fetch(`${API}/query`, { method: 'POST', headers, body: JSON.stringify({ table: 'orders' }) });
    const body = await res.json();
    if (!res.ok || body.error) throw new Error('list orders failed: ' + JSON.stringify(body));
    const found = (body.data || []).some(o => o.id === order.id);
    console.log('Orders fetched:', (body.data || []).length, 'contains new order?', found);
  }

  console.log('SMOKE TEST OK');
}

main().catch(err => { console.error('SMOKE TEST FAILED', err); process.exit(1); });
