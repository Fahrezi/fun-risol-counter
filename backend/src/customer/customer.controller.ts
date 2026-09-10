import { Body, Controller, Get, Post } from '@nestjs/common';
import { CustomerService } from './customer.service.js';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  findAll() {
    return this.customerService.findAll();
  }

  @Post()
  create(@Body() body: { name: string }) {
    return this.customerService.create(body);
  }
}
