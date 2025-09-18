CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT now()
);

-- Ensure extended product attributes exist (idempotent)
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_quantity INTEGER DEFAULT 1;
ALTER TABLE products ADD COLUMN IF NOT EXISTS bag_size TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS number_of_servings INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS serving_size TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS amino_acid_profile JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS nutritional_info JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight NUMERIC(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category INTEGER REFERENCES product_categories(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE;

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  user_name TEXT,
  email TEXT,
  items JSONB,
  total NUMERIC(10,2),
  status TEXT,
  payment_method TEXT,
  shipping_address JSONB,
  shipping_option JSONB,
  invoice_status TEXT,
  invoice_url TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  is_sample BOOLEAN DEFAULT false
);

-- Align existing orders table to expected schema (idempotent)
DO $$ BEGIN
  -- Convert id to TEXT and drop default if it exists (supports custom IDs like SAMPLE-...)
  BEGIN
    ALTER TABLE orders ALTER COLUMN id TYPE TEXT USING id::text;
  EXCEPTION WHEN others THEN NULL;
  END;
  BEGIN
    ALTER TABLE orders ALTER COLUMN id DROP DEFAULT;
  EXCEPTION WHEN others THEN NULL;
  END;
END $$;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_option JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_status TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT now();
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS tracking_info (
  id SERIAL PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  tracking_number TEXT,
  carrier TEXT,
  tracking_url TEXT,
  shipped_date TIMESTAMP,
  estimated_delivery_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Align existing tracking_info table to expected schema (idempotent)
ALTER TABLE tracking_info ALTER COLUMN order_id TYPE TEXT USING order_id::text;
ALTER TABLE tracking_info ADD COLUMN IF NOT EXISTS tracking_url TEXT;
ALTER TABLE tracking_info ADD COLUMN IF NOT EXISTS shipped_date TIMESTAMP;
ALTER TABLE tracking_info ADD COLUMN IF NOT EXISTS estimated_delivery_date TIMESTAMP;
ALTER TABLE tracking_info ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT now();

-- Minimal shipping_addresses table to satisfy allowlist and avoid missing relation errors
CREATE TABLE IF NOT EXISTS shipping_addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
  street TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marketing (
  id SERIAL PRIMARY KEY,
  path TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY,
  business_name TEXT,
  business_address TEXT,
  phone TEXT,
  business_type TEXT,
  email TEXT,
  payment_terms INTEGER DEFAULT 14,
  created_at TIMESTAMP DEFAULT now()
);

-- Ensure approval fields exist for profiles (idempotent)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approved_by INTEGER;

CREATE TABLE IF NOT EXISTS reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  token TEXT UNIQUE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  role TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pricing_tiers (
  id SERIAL PRIMARY KEY,
  name TEXT,
  multiplier NUMERIC(5,2) DEFAULT 1,
  created_at TIMESTAMP DEFAULT now()
);

-- Ensure expected columns exist for pricing tiers (idempotent)
ALTER TABLE pricing_tiers ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE pricing_tiers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT now();

-- Seed default pricing tiers (idempotent)
INSERT INTO pricing_tiers(name, description)
SELECT t.name, t.description FROM (VALUES
  ('Bronze', 'Entry tier pricing'),
  ('Silver', 'Mid tier pricing'),
  ('Gold', 'Top tier pricing')
) AS t(name, description)
WHERE NOT EXISTS (SELECT 1 FROM pricing_tiers p WHERE p.name = t.name);

CREATE TABLE IF NOT EXISTS business_types (
  id SERIAL PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Product categories for assigning products to a category
CREATE TABLE IF NOT EXISTS product_categories (
  id SERIAL PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Seed common business types (idempotent)
INSERT INTO business_types(name)
SELECT t.name FROM (VALUES
  ('Protein Powder Retailer'),
  ('Gym / Fitness Studio'),
  ('Cafe / Hospitality'),
  ('Health Food Store'),
  ('Online Store'),
  ('Dietitian / Nutritionist'),
  ('Influencer'),
  ('Distributor / Wholesaler')
) AS t(name)
WHERE NOT EXISTS (SELECT 1 FROM business_types b WHERE b.name = t.name);

-- User pricing tiers assignment table
CREATE TABLE IF NOT EXISTS user_pricing_tiers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  tier_id INTEGER REFERENCES pricing_tiers(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Product prices per tier
CREATE TABLE IF NOT EXISTS product_prices (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  tier_id INTEGER REFERENCES pricing_tiers(id) ON DELETE CASCADE,
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(product_id, tier_id)
);
