import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { OrderService } from './order.service.js';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Post()
  create(@Body() body: { listName: string; items: { foodId: string; qty: number }[] }) {
    return this.orderService.create(body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.orderService.remove(id);
    return { ok: true };
  }
}
