import { Module } from '@nestjs/common';
import { FoodModule } from './food/food.module.js';
import { OrderModule } from './order/order.module.js';
import { CustomerModule } from './customer/customer.module.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [FoodModule, OrderModule, CustomerModule, AuthModule],
})
export class AppModule {}
