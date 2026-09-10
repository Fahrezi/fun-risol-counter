import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Customer, readDb, writeDb } from '../data/store.js';

@Injectable()
export class CustomerService {
  findAll(): Customer[] {
    return readDb().customers;
  }

  create(data: { name: string }): Customer {
    const trimmed = data.name.trim();
    const db = readDb();
    const existing = db.customers.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing;

    const customer: Customer = { id: randomUUID(), name: trimmed };
    db.customers.push(customer);
    writeDb(db);
    return customer;
  }
}
