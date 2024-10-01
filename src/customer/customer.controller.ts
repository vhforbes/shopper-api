import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { CreateCustomerDto } from './interfaces';
import { CustomerEntity } from './customer.entity';
import { CustomerService } from './customer.service';

@Controller()
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('create-customer')
  async createCustomer(
    @Body() body: CreateCustomerDto,
  ): Promise<CustomerEntity> {
    if (!body.email || !body.name) {
      throw new BadRequestException({
        error_code: 'INVALID_DATA',
        error_description: 'Fields: email & name are required.',
      });
    }

    return await this.customerService.createCustomer(body);
  }
}
