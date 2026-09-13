import { Hono } from 'hono';
import { cors } from 'hono/cors';

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

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors());

// --- auth ---

app.post('/auth/verify', async (c) => {
  const body = await c.req.json<{ value?: string }>().catch(() => ({}));
  const row = await c.env.DB.prepare('SELECT secret_word FROM settings WHERE id = 1').first<{
    secret_word: string;
  }>();
  return c.json({ ok: row?.secret_word === (body.value ?? '') });
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
  await c.env.DB.prepare('DELETE FROM foods WHERE id = ?').bind(id).run();
  return c.json({ ok: true });
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

  const items: OrderItemJson[] = [];
  for (const reqItem of requested) {
    const food = await c.env.DB.prepare('SELECT id, name, price, icon FROM foods WHERE id = ?')
      .bind(reqItem.foodId)
      .first<FoodRow>();
    if (!food) return c.json({ message: `Unknown food ${reqItem.foodId}` }, 400);
    items.push({ foodId: food.id, name: food.name, price: food.price, qty: reqItem.qty });
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
  ];
  await c.env.DB.batch(statements);

  return c.json(order);
});

app.delete('/orders/:id', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.batch([
    c.env.DB.prepare('DELETE FROM order_items WHERE order_id = ?').bind(id),
    c.env.DB.prepare('DELETE FROM orders WHERE id = ?').bind(id),
  ]);
  return c.json({ ok: true });
});

export default app;
