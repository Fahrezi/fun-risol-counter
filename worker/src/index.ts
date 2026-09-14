import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';

interface Bindings {
  DB: D1Database;
}

interface FoodRow {
  id: string;
  name: string;
  price: number;
  icon: string;
}

interface CustomerRow {
  id: string;
  name: string;
}

interface OrderRow {
  id: string;
  list_name: string;
  total: number;
  created_at: string;
  items_json: string | null;
}

interface OrderItemJson {
  foodId: string;
  name: string;
  price: number;
  qty: number;
}

interface FoodStockRow {
  id: string;
  name: string;
  price: number;
  icon: string;
  qty: number;
  stock_date: string;
}

interface StockHistoryRow {
  id: number;
  food_id: string;
  food_name: string;
  qty: number;
  stock_date: string;
  archived_at: string;
}

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  '*',
  cors({
    origin: (origin) => origin,
    credentials: true,
  }),
);

const SESSION_COOKIE = 'mmdg_session';
const SESSION_TTL_SECONDS = 7 * 24 * 3600;

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// --- stock helpers ---

function todayJakarta(): string {
  return new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);
}

function dateJakarta(iso: string): string {
  return new Date(new Date(iso).getTime() + 7 * 3600 * 1000).toISOString().slice(0, 10);
}

async function rolloverStock(db: D1Database): Promise<string> {
  const today = todayJakarta();
  await db.batch([
    db.prepare(
      `INSERT INTO stock_history (food_id, food_name, qty, stock_date, archived_at)
       SELECT fs.food_id, f.name, fs.qty, fs.stock_date, ?
       FROM food_stock fs JOIN foods f ON f.id = fs.food_id
       WHERE fs.stock_date <> ? AND fs.qty > 0`,
    ).bind(new Date().toISOString(), today),
    db
      .prepare('UPDATE food_stock SET qty = 0, stock_date = ? WHERE stock_date <> ?')
      .bind(today, today),
  ]);
  return today;
}

// --- auth ---

app.post('/auth/verify', async (c) => {
  const body = await c.req.json<{ value?: string }>().catch(() => ({}) as { value?: string });
  const row = await c.env.DB.prepare('SELECT secret_hash FROM settings WHERE id = 1').first<{
    secret_hash: string;
  }>();
  const inputHash = await sha256Hex(body.value ?? '');
  const ok = !!row && row.secret_hash === inputHash;
  if (!ok) return c.json({ ok: false });

  const token = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_SECONDS * 1000);
  await c.env.DB.prepare('INSERT INTO sessions (token, created_at, expires_at) VALUES (?, ?, ?)')
    .bind(token, now.toISOString(), expiresAt.toISOString())
    .run();

  setCookie(c, SESSION_COOKIE, token, {
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
    httpOnly: false,
    secure: true,
    sameSite: 'None',
  });

  return c.json({ ok: true });
});

app.post('/auth/logout', async (c) => {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) {
    await c.env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
  }
  deleteCookie(c, SESSION_COOKIE, { path: '/' });
  return c.json({ ok: true });
});

// --- customers ---

app.get('/customers', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, name FROM customers ORDER BY rowid ASC',
  ).all<CustomerRow>();
  return c.json(results);
});

app.post('/customers', async (c) => {
  const body = await c.req.json<{ name: string }>();
  const trimmed = body.name.trim();

  const existing = await c.env.DB.prepare(
    'SELECT id, name FROM customers WHERE lower(name) = lower(?)',
  )
    .bind(trimmed)
    .first<CustomerRow>();
  if (existing) return c.json(existing);

  const customer: CustomerRow = { id: crypto.randomUUID(), name: trimmed };
  await c.env.DB.prepare('INSERT INTO customers (id, name) VALUES (?, ?)')
    .bind(customer.id, customer.name)
    .run();
  return c.json(customer);
});

// --- foods ---

app.get('/foods', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, name, price, icon FROM foods ORDER BY rowid ASC',
  ).all<FoodRow>();
  return c.json(results);
});

app.post('/foods', async (c) => {
  const body = await c.req.json<{ name: string; price: number; icon?: string }>();
  const food: FoodRow = {
    id: crypto.randomUUID(),
    name: body.name,
    price: body.price,
    icon: body.icon ?? 'generic',
  };
  await c.env.DB.prepare('INSERT INTO foods (id, name, price, icon) VALUES (?, ?, ?, ?)')
    .bind(food.id, food.name, food.price, food.icon)
    .run();
  return c.json(food);
});

app.patch('/foods/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<{ name?: string; price?: number; icon?: string }>();

  const existing = await c.env.DB.prepare('SELECT id, name, price, icon FROM foods WHERE id = ?')
    .bind(id)
    .first<FoodRow>();
  if (!existing) return c.json({ message: 'Food not found' }, 404);

  const updated: FoodRow = {
    id: existing.id,
    name: body.name ?? existing.name,
    price: body.price ?? existing.price,
    icon: body.icon ?? existing.icon,
  };
  await c.env.DB.prepare('UPDATE foods SET name = ?, price = ?, icon = ? WHERE id = ?')
    .bind(updated.name, updated.price, updated.icon, updated.id)
    .run();
  return c.json(updated);
});

app.delete('/foods/:id', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.batch([
    c.env.DB.prepare('DELETE FROM food_stock WHERE food_id = ?').bind(id),
    c.env.DB.prepare('DELETE FROM foods WHERE id = ?').bind(id),
  ]);
  return c.json({ ok: true });
});

// --- stock ---

app.get('/stock', async (c) => {
  const today = await rolloverStock(c.env.DB);
  const { results } = await c.env.DB.prepare(
    `SELECT f.id, f.name, f.price, f.icon,
       COALESCE(fs.qty, 0) AS qty,
       COALESCE(fs.stock_date, ?) AS stock_date
     FROM foods f LEFT JOIN food_stock fs ON fs.food_id = f.id
     ORDER BY f.rowid ASC`,
  )
    .bind(today)
    .all<FoodStockRow>();
  return c.json(
    results.map((r) => ({
      id: r.id,
      name: r.name,
      price: r.price,
      icon: r.icon,
      qty: r.qty,
      stockDate: r.stock_date,
    })),
  );
});

app.put('/stock/:foodId', async (c) => {
  const foodId = c.req.param('foodId');
  const today = await rolloverStock(c.env.DB);
  const body = await c.req.json<{ qty?: number }>();

  const food = await c.env.DB.prepare('SELECT id FROM foods WHERE id = ?').bind(foodId).first();
  if (!food) return c.json({ message: `Unknown food ${foodId}` }, 400);
  if (typeof body.qty !== 'number' || body.qty < 0) {
    return c.json({ message: 'qty must be a number >= 0' }, 400);
  }

  await c.env.DB.prepare(
    `INSERT INTO food_stock (food_id, qty, stock_date) VALUES (?, ?, ?)
     ON CONFLICT(food_id) DO UPDATE SET qty = excluded.qty, stock_date = excluded.stock_date`,
  )
    .bind(foodId, body.qty, today)
    .run();

  return c.json({ foodId, qty: body.qty, stockDate: today });
});

app.get('/stock/history', async (c) => {
  await rolloverStock(c.env.DB);
  const { results } = await c.env.DB.prepare(
    'SELECT id, food_id, food_name, qty, stock_date, archived_at FROM stock_history ORDER BY id DESC LIMIT 50',
  ).all<StockHistoryRow>();
  return c.json(
    results.map((r) => ({
      id: r.id,
      foodId: r.food_id,
      foodName: r.food_name,
      qty: r.qty,
      stockDate: r.stock_date,
      archivedAt: r.archived_at,
    })),
  );
});

// --- orders ---

const ORDERS_SELECT = `
  SELECT o.id, o.list_name, o.total, o.created_at,
    (SELECT json_group_array(json_object(
        'foodId', oi.food_id, 'name', oi.name, 'price', oi.price, 'qty', oi.qty))
     FROM order_items oi WHERE oi.order_id = o.id) AS items_json
  FROM orders o
`;

function rowToOrder(row: OrderRow) {
  return {
    id: row.id,
    listName: row.list_name,
    items: (row.items_json ? JSON.parse(row.items_json) : []) as OrderItemJson[],
    total: row.total,
    createdAt: row.created_at,
  };
}

app.get('/orders', async (c) => {
  const { results } = await c.env.DB.prepare(`${ORDERS_SELECT} ORDER BY o.rowid DESC`).all<OrderRow>();
  return c.json(results.map(rowToOrder));
});

app.post('/orders', async (c) => {
  const body = await c.req.json<{
    listName: string;
    items: { foodId: string; qty: number }[];
  }>();

  const listName = body.listName?.trim();
  if (!listName) return c.json({ message: 'listName required' }, 400);

  const requested = (body.items ?? []).filter((i) => i.qty > 0);
  if (!requested.length) return c.json({ message: 'items required' }, 400);

  const qtyByFoodId = new Map<string, number>();
  for (const reqItem of requested) {
    qtyByFoodId.set(reqItem.foodId, (qtyByFoodId.get(reqItem.foodId) ?? 0) + reqItem.qty);
  }

  const today = await rolloverStock(c.env.DB);

  const items: OrderItemJson[] = [];
  for (const [foodId, qty] of qtyByFoodId) {
    const food = await c.env.DB.prepare('SELECT id, name, price, icon FROM foods WHERE id = ?')
      .bind(foodId)
      .first<FoodRow>();
    if (!food) return c.json({ message: `Unknown food ${foodId}` }, 400);

    const stock = await c.env.DB.prepare(
      'SELECT qty FROM food_stock WHERE food_id = ? AND stock_date = ?',
    )
      .bind(foodId, today)
      .first<{ qty: number }>();
    const available = stock?.qty ?? 0;
    if (qty > available) return c.json({ message: `Stok ${food.name} tidak cukup` }, 400);

    items.push({ foodId: food.id, name: food.name, price: food.price, qty });
  }

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const order = {
    id: crypto.randomUUID(),
    listName,
    items,
    total,
    createdAt: new Date().toISOString(),
  };

  const statements = [
    c.env.DB.prepare(
      'INSERT INTO orders (id, list_name, total, created_at) VALUES (?, ?, ?, ?)',
    ).bind(order.id, order.listName, order.total, order.createdAt),
    ...items.map((i) =>
      c.env.DB.prepare(
        'INSERT INTO order_items (order_id, food_id, name, price, qty) VALUES (?, ?, ?, ?, ?)',
      ).bind(order.id, i.foodId, i.name, i.price, i.qty),
    ),
    ...items.map((i) =>
      c.env.DB.prepare(
        'UPDATE food_stock SET qty = qty - ? WHERE food_id = ? AND stock_date = ?',
      ).bind(i.qty, i.foodId, today),
    ),
  ];
  await c.env.DB.batch(statements);

  return c.json(order);
});

app.delete('/orders/:id', async (c) => {
  const id = c.req.param('id');
  const today = await rolloverStock(c.env.DB);

  const order = await c.env.DB.prepare('SELECT id, created_at FROM orders WHERE id = ?')
    .bind(id)
    .first<{ id: string; created_at: string }>();

  const statements = [
    c.env.DB.prepare('DELETE FROM order_items WHERE order_id = ?').bind(id),
    c.env.DB.prepare('DELETE FROM orders WHERE id = ?').bind(id),
  ];

  if (order && dateJakarta(order.created_at) === today) {
    const { results } = await c.env.DB.prepare(
      'SELECT food_id, qty FROM order_items WHERE order_id = ?',
    )
      .bind(id)
      .all<{ food_id: string; qty: number }>();
    for (const item of results) {
      statements.push(
        c.env.DB.prepare(
          'UPDATE food_stock SET qty = qty + ? WHERE food_id = ? AND stock_date = ?',
        ).bind(item.qty, item.food_id, today),
      );
    }
  }

  await c.env.DB.batch(statements);
  return c.json({ ok: true });
});

export default app;
