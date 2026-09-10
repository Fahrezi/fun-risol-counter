import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Food, readDb, writeDb } from '../data/store.js';

@Injectable()
export class FoodService {
  findAll(): Food[] {
    return readDb().foods;
  }

  create(data: { name: string; price: number; icon?: string }): Food {
    const db = readDb();
    const food: Food = {
      id: randomUUID(),
      name: data.name,
      price: data.price,
      icon: data.icon ?? 'generic',
    };
    db.foods.push(food);
    writeDb(db);
    return food;
  }

  update(id: string, data: Partial<Pick<Food, 'name' | 'price' | 'icon'>>): Food {
    const db = readDb();
    const food = db.foods.find((f) => f.id === id);
    if (!food) throw new NotFoundException('Food not found');
    Object.assign(food, data);
    writeDb(db);
    return food;
  }

  remove(id: string): void {
    const db = readDb();
    db.foods = db.foods.filter((f) => f.id !== id);
    writeDb(db);
  }
}
