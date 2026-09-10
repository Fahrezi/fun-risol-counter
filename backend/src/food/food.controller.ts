import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { FoodService } from './food.service.js';

@Controller('foods')
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Get()
  findAll() {
    return this.foodService.findAll();
  }

  @Post()
  create(@Body() body: { name: string; price: number; icon?: string }) {
    return this.foodService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; price?: number; icon?: string },
  ) {
    return this.foodService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.foodService.remove(id);
    return { ok: true };
  }
}
