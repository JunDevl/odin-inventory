CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS entities (
  user_id uuid REFERENCES users ON DELETE CASCADE, 
  name TEXT,

  trade TEXT,

  PRIMARY KEY (user_id, name)
);

CREATE TABLE IF NOT EXISTS entities_franchises (
  entity_user_id uuid,
  entity_name TEXT,
  address TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (entity_user_id, entity_name) REFERENCES entities (user_id, name) ON DELETE CASCADE,
  PRIMARY KEY (entity_user_id, entity_name, address)
);

CREATE OR REPLACE FUNCTION create_special()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO entities (user_id, name)
  VALUES (NEW.id, NEW.name);
  INSERT INTO entities_franchises (entity_user_id, entity_name, address)
  VALUES (NEW.id, NEW.name, 'Myself');
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER insert_special_user_entity
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_special();

CREATE INDEX entities_franchises_idx ON entities_franchises(entity_user_id);

CREATE TYPE entity_kind AS ENUM (
  'client', 'supplier', 'service_provider'
);

CREATE TABLE IF NOT EXISTS outsourced_entity_franchise_types (
  franchise_user_id uuid,
  entity_name TEXT,
  franchise_address TEXT,

  type entity_kind,

  FOREIGN KEY (franchise_user_id, entity_name, franchise_address) REFERENCES entities_franchises (entity_user_id, entity_name, address) ON DELETE CASCADE,
  PRIMARY KEY (franchise_user_id, entity_name, franchise_address, type)
);

CREATE TABLE IF NOT EXISTS items (
  user_id uuid REFERENCES users ON DELETE CASCADE, 
  name TEXT,

  description TEXT,

  PRIMARY KEY (user_id, name)
);

CREATE INDEX items_idx ON items(user_id);

CREATE TABLE IF NOT EXISTS item_categories (
  user_id uuid REFERENCES users ON DELETE CASCADE, 
  name TEXT,

  description TEXT,

  PRIMARY KEY (user_id, name)
);

CREATE TABLE IF NOT EXISTS categories_of_items (
  item_user_id uuid,
  item_name TEXT,

  category_user_id uuid,
  category_name TEXT,

  FOREIGN KEY (item_user_id, item_name) REFERENCES items (user_id, name) ON DELETE CASCADE,
  FOREIGN KEY (category_user_id, category_name) REFERENCES item_categories (user_id, name) ON DELETE CASCADE,
  PRIMARY KEY (item_user_id, item_name, category_user_id, category_name)
);

CREATE TABLE IF NOT EXISTS item_units (
  user_id uuid REFERENCES users ON DELETE CASCADE, 
  name TEXT,

  description TEXT,
  wikipedia_url TEXT,

  PRIMARY KEY (user_id, name)
);

CREATE TABLE IF NOT EXISTS items_unit_price_history (
  item_user_id uuid,
  item_name TEXT,

  history_id INTEGER GENERATED ALWAYS AS IDENTITY,

  unit_user_id uuid NOT NULL,
  unit_name TEXT NOT NULL,

  price_cents INTEGER NOT NULL,
  priced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

  FOREIGN KEY (item_user_id, item_name) REFERENCES items (user_id, name) ON DELETE CASCADE,
  FOREIGN KEY (unit_user_id, unit_name) REFERENCES item_units (user_id, name) ON DELETE CASCADE,
  PRIMARY KEY (item_user_id, item_name, history_id)
);

CREATE TABLE IF NOT EXISTS operations (
  user_id uuid REFERENCES users ON DELETE CASCADE,
  operation_id INTEGER GENERATED ALWAYS AS IDENTITY,
  
  item_user_id uuid NOT NULL,
  item_name TEXT NOT NULL,

  unit_price_user_id uuid NOT NULL,
  unit_price_item_name TEXT NOT NULL,
  unit_price_id INTEGER NOT NULL,

  quantity NUMERIC NOT NULL,

  addressee_user_id uuid NOT NULL,
  addressee_entity_name TEXT NOT NULL,
  addressee_franchise_address TEXT NOT NULL,

  sendee_user_id uuid NOT NULL,
  sendee_entity_name TEXT NOT NULL,
  sendee_franchise_address TEXT NOT NULL,

  shipped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  arrived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (item_user_id, item_name) REFERENCES items (user_id, name) ON DELETE CASCADE,
  FOREIGN KEY (unit_price_user_id, unit_price_item_name, unit_price_id) REFERENCES items_unit_price_history (item_user_id, item_name, history_id) ON DELETE CASCADE,
  FOREIGN KEY (addressee_user_id, addressee_entity_name, addressee_franchise_address) REFERENCES entities_franchises (entity_user_id, entity_name, address) ON DELETE CASCADE,
  FOREIGN KEY (sendee_user_id, sendee_entity_name, sendee_franchise_address) REFERENCES entities_franchises (entity_user_id, entity_name, address) ON DELETE CASCADE,
  PRIMARY KEY (user_id, operation_id)
);

CREATE INDEX operations_idx ON operations(user_id);

CREATE VIEW operations_with_totals AS
SELECT o.*, (p.price_cents), (p.price_cents * o.quantity) AS total_price_cents 
FROM operations AS o
JOIN items_unit_price_history p ON CONCAT(o.unit_price_user_id, o.unit_price_item_name, o.unit_price_id) = CONCAT(p.item_user_id, p.item_name, p.history_id);