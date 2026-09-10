import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Order, OrderItem, readDb, writeDb } from '../data/store.js';

interface CreateOrderItem {
  foodId: string;
  qty: number;
}

@Injectable()
export class OrderService {
  findAll(): Order[] {
    return readDb().orders.slice().reverse();
  }

  create(data: { listName: string; items: CreateOrderItem[] }): Order {
    if (!data.listName?.trim()) throw new BadRequestException('listName required');
    if (!data.items?.length) throw new BadRequestException('items required');

    const db = readDb();
    const items: OrderItem[] = data.items
      .filter((i) => i.qty > 0)
      .map((i) => {
        const food = db.foods.find((f) => f.id === i.foodId);
        if (!food) throw new BadRequestException(`Unknown food ${i.foodId}`);
        return { foodId: food.id, name: food.name, price: food.price, qty: i.qty };
      });
    if (!items.length) throw new BadRequestException('items required');

    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const order: Order = {
      id: randomUUID(),
      listName: data.listName.trim(),
      items,
      total,
      createdAt: new Date().toISOString(),
    };
    db.orders.push(order);
    writeDb(db);
    return order;
  }

  remove(id: string): void {
    const db = readDb();
    db.orders = db.orders.filter((o) => o.id !== id);
    writeDb(db);
  }
}
