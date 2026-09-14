CREATE TABLE food_stock (
  food_id    TEXT PRIMARY KEY REFERENCES foods(id),
  qty        INTEGER NOT NULL DEFAULT 0,
  stock_date TEXT NOT NULL DEFAULT ''
);

CREATE TABLE stock_history (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  food_id     TEXT NOT NULL,
  food_name   TEXT NOT NULL,
  qty         INTEGER NOT NULL,
  stock_date  TEXT NOT NULL,
  archived_at TEXT NOT NULL
);

CREATE INDEX ix_stock_history_date ON stock_history (stock_date DESC, id DESC);
