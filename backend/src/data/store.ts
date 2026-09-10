import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

export interface Food {
  id: string;
  name: string;
  price: number;
  icon: string;
}

export interface OrderItem {
  foodId: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  listName: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
}

export interface Settings {
  secretWord: string;
}

interface Db {
  foods: Food[];
  orders: Order[];
  customers: Customer[];
  settings: Settings;
}

const DB_DIR = join(process.cwd(), 'data');
const DB_FILE = join(DB_DIR, 'db.json');

const DEFAULT_DB: Db = {
  foods: [
    { id: 'risol-mayo', name: 'Risol Mayo', price: 5000, icon: 'risol-mayo' },
    { id: 'risol-sayur', name: 'Risol Sayur', price: 4000, icon: 'risol-sayur' },
    { id: 'pisang-coklat', name: 'Pisang Coklat', price: 4500, icon: 'pisang-coklat' },
    { id: 'ketan-serundeng', name: 'Ketan Serundeng', price: 6000, icon: 'ketan-serundeng' },
  ],
  orders: [],
  customers: [],
  settings: { secretWord: 'banyak_yang_bilang' },
};

function ensureDb(): void {
  if (!existsSync(DB_DIR)) mkdirSync(DB_DIR, { recursive: true });
  if (!existsSync(DB_FILE)) writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2));
}

export function readDb(): Db {
  ensureDb();
  const db = JSON.parse(readFileSync(DB_FILE, 'utf-8')) as Db;
  let dirty = false;
  if (!db.customers) {
    const names = new Set(db.orders.map((o) => o.listName));
    db.customers = Array.from(names).map((name) => ({ id: randomUUID(), name }));
    dirty = true;
  }
  if (!db.settings) {
    db.settings = { secretWord: 'banyak_yang_bilang' };
    dirty = true;
  }
  if (dirty) writeDb(db);
  return db;
}

export function writeDb(db: Db): void {
  writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}
