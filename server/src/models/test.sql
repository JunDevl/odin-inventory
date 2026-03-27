CREATE TABLE users (
  id uuid DEFAULT gen_random_uuid() NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  password_hash TEXT NOT NULL
);
CREATE TABLE users_entities (
  user_id INTEGER REFERENCES users NOT NULL,
  entity_id INTEGER REFERENCES entities NOT NULL
);
CREATE TABLE users_entities_franchises (
  user_id INTEGER REFERENCES users NOT NULL,
  franchise_id INTEGER REFERENCES entities_franchises NOT NULL,
  address TEXT NOT NULL UNIQUE
);
CREATE TABLE users_items (
  user_id INTEGER REFERENCES users NOT NULL,
  item_id INTEGER REFERENCES items NOT NULL,
  name TEXT NOT NULL UNIQUE,
  description TEXT
);
CREATE TABLE users_item_categories (
  user_id INTEGER REFERENCES users NOT NULL,
  category_id INTEGER REFERENCES item_categories NOT NULL,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL UNIQUE
);
CREATE TABLE users_item_units (
  unit_id REFERENCES item_units NOT NULL,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  wikipedia_url TEXT
);
CREATE TABLE users_operations (
  user_id INTEGER REFERENCES users NOT NULL,
  operation_id INTEGER REFERENCES operations NOT NULL
);
CREATE TABLE storage_areas (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_by INTEGER REFERENCES users NOT NULL,
  description TEXT NOT NULL,
  location_reference TEXT NOT NULL,
  address TEXT UNIQUE
);
CREATE TABLE entities (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_by INTEGER REFERENCES users NOT NULL,
  name TEXT NOT NULL,
  trade TEXT
);
CREATE TABLE entities_franchises (
  id INTEGER PRIMARY KEY,
  created_by INTEGER REFERENCES users NOT NULL,
  entity_id INTEGER REFERENCES entities NOT NULL,
);
CREATE TABLE outsourced_client_entities (
  entity_id INTEGER REFERENCES entities NOT NULL UNIQUE,
  created_by INTEGER REFERENCES users NOT NULL,
) CREATE TABLE outsourced_supplier_entities (
  entity_id INTEGER REFERENCES entities NOT NULL UNIQUE,
  created_by INTEGER REFERENCES users NOT NULL,
) CREATE TABLE outsourced_service_provider_entities (
  entity_id INTEGER REFERENCES entities NOT NULL UNIQUE,
  created_by INTEGER REFERENCES users NOT NULL,
) CREATE TABLE entities_storage_areas (
  owner_id INTEGER REFERENCES entities NOT NULL,
  owner_franchise_id INTEGER REFERENCES entities_franchises NOT NULL,
  address TEXT NOT NULL UNIQUE,
);
CREATE TABLE items (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_by INTEGER REFERENCES users NOT NULL,
);
CREATE TABLE item_categories (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_by INTEGER REFERENCES users NOT NULL,
);
CREATE TABLE categories_of_items (
  item_id INTEGER REFERENCES items NOT NULL,
  created_by INTEGER REFERENCES users NOT NULL,
  category_id REFERENCES item_category NOT NULL
);
CREATE TABLE item_units (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_by INTEGER REFERENCES users NOT NULL,
);
CREATE TABLE item_price_history (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_by INTEGER REFERENCES users NOT NULL,
  item_id INTEGER REFERENCES items NOT NULL,
  price_cents INTEGER NOT NULL,
  priced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE operations (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_by INTEGER REFERENCES users NOT NULL,
  shipped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  arrived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  item_id REFERENCES items NOT NULL,
  quantity NUMERIC NOT NULL,
  unit_id INTEGER REFERENCES units NOT NULL,
  addressee_id INTEGER REFERENCES entity NOT NULL,
  sendee_id INTEGER REFERENCES entity NOT NULL,
);