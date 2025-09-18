#!/usr/bin/env node
// Import products from a CSV file and insert/update into DB.
// Usage: node scripts/import_csv_products.js ./data/products_with_macros_no_samples.csv

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@db:5432/postgres'
});

async function ensureCategory(name) {
  const { rows } = await pool.query('SELECT id FROM product_categories WHERE name=$1', [name]);
  if (rows.length) return rows[0].id;
  const ins = await pool.query('INSERT INTO product_categories(name) VALUES($1) RETURNING id', [name]);
  return ins.rows[0].id;
}

async function upsertProduct(row, categoryId) {
  // Normalize and map fields
  const name = (row.title || '').trim() || 'Untitled';
  const description = (row.description || '').trim() || null;
  // Force price to 37.00 per request
  const price = 37.0;
  const sku = (row.sku || '').trim() || null;
  const image = (row.image || '').trim() || null;
  const weightStr = (row.weight_kg || '').replace(/[^0-9.]/g, '');
  const weight = weightStr ? Number.parseFloat(weightStr) : null;
  const minQtyStr = (row.min_order || '').replace(/[^0-9]/g, '');
  const min_quantity = minQtyStr ? Number.parseInt(minQtyStr, 10) : 1;
  const serving_size = (row.serving_size || '').trim() || null;
  const bag_size = (row.bag_size || '').trim() || null;
  const metadata = {
    source_url: row.url || null,
    image_url: image,
  };

  // Try to locate existing product by SKU first, otherwise by name
  let existing = null;
  if (sku) {
    const { rows } = await pool.query('SELECT id FROM products WHERE sku=$1', [sku]);
    if (rows.length) existing = rows[0];
  }
  if (!existing) {
    const { rows } = await pool.query('SELECT id FROM products WHERE name=$1', [name]);
    if (rows.length) existing = rows[0];
  }

  if (existing) {
    await pool.query(
      'UPDATE products SET name=$1, description=$2, price=$3, metadata=$4, sku=COALESCE($5, sku), image=$6, weight=$7, min_quantity=$8, serving_size=$9, bag_size=$10, category=$11 WHERE id=$12',
      [name, description, price, metadata, sku, image, weight, min_quantity, serving_size, bag_size, categoryId, existing.id]
    );
    return { updated: 1, inserted: 0 };
  } else {
    await pool.query(
      'INSERT INTO products(name, description, price, metadata, sku, image, weight, min_quantity, serving_size, bag_size, category) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
      [name, description, price, metadata, sku, image, weight, min_quantity, serving_size, bag_size, categoryId]
    );
    return { updated: 0, inserted: 1 };
  }
}

async function main() {
  const fileArg = process.argv[2] || path.join(__dirname, '..', 'data', 'products_with_macros_no_samples.csv');
  if (!fs.existsSync(fileArg)) {
    console.error('CSV file not found:', fileArg);
    process.exit(1);
  }

  const categoryId = await ensureCategory('Protein Powder');
  console.log('Using category id', categoryId, 'for Protein Powder');

  const raw = fs.readFileSync(fileArg, 'utf8');
  const allLines = raw.split(/\r?\n/).filter(l => l.length > 0);
  if (allLines.length < 2) {
    console.error('No data rows in CSV');
    process.exit(1);
  }

  // CSV line parser with quotes
  function parseCsvLine(str) {
    const out = [];
    let cur = '';
    let inQuotes = false;
    for (let j = 0; j < str.length; j++) {
      const ch = str[j];
      if (ch === '"') {
        if (inQuotes && str[j+1] === '"') { cur += '"'; j++; }
        else { inQuotes = !inQuotes; }
      } else if (ch === ',' && !inQuotes) {
        out.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out;
  }

  const header = parseCsvLine(allLines[0]).map(s => s.trim());
  const lines = allLines.slice(1);
  let inserted = 0, updated = 0, total = 0;

  // Expect header on first line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fields = parseCsvLine(line).map(s => (s || '').trim());
    try {
      const row = {};
      for (let c = 0; c < header.length && c < fields.length; c++) {
        row[header[c]] = fields[c];
      }
      const title = (row.title || '').trim();
      if (!title) { continue; }
      // ensure we have image url; if not, try to pick first http url in fields
      if (!row.image || !/^https?:\/\//i.test(row.image)) {
        const maybe = fields.find(v => /^https?:\/\//i.test(v));
        if (maybe) row.image = maybe;
      }
      const obj = {
        url: row.url,
        title: row.title,
        price: row.price,
        sku: row.sku,
        stock: row.stock,
        min_order: row.min_order,
        weight_kg: row.weight_kg,
        serving_size: row.serving_size,
        bag_size: row.bag_size,
        ingredients: row.ingredients,
        description: row.description,
        image: row.image,
      };
      const res = await upsertProduct(obj, categoryId);
      inserted += res.inserted;
      updated += res.updated;
      total++;
    } catch (e) {
      console.error('Failed to import line', i+2, e.message);
    }
  }

  console.log(JSON.stringify({ ok: true, total, inserted, updated }));
  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
