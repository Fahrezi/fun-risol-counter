CREATE TABLE foods (
  id    TEXT PRIMARY KEY,
  name  TEXT NOT NULL,
  price INTEGER NOT NULL,
  icon  TEXT NOT NULL DEFAULT 'generic'
);

CREATE TABLE customers (
  id   TEXT PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE UNIQUE INDEX ux_customers_name_ci ON customers (lower(name));

CREATE TABLE settings (
  id          INTEGER PRIMARY KEY CHECK (id = 1),
  secret_word TEXT NOT NULL
);

CREATE TABLE orders (
  id         TEXT PRIMARY KEY,
  list_name  TEXT NOT NULL,
  total      INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE order_items (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL REFERENCES orders(id),
  food_id  TEXT NOT NULL,
  name     TEXT NOT NULL,
  price    INTEGER NOT NULL,
  qty      INTEGER NOT NULL
);

INSERT INTO foods (id, name, price, icon) VALUES
  ('risol-mayo', 'Risol Mayo', 5000, 'risol-mayo'),
  ('risol-sayur', 'Risol Sayur', 4000, 'risol-sayur'),
  ('pisang-coklat', 'Pisang Coklat', 4500, 'pisang-coklat'),
  ('ketan-serundeng', 'Ketan Serundeng', 6000, 'ketan-serundeng');

INSERT INTO settings (id, secret_word) VALUES (1, 'banyak_yang_bilang');
