/* eslint-disable prettier/prettier */
import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { EmployeeResponse } from './dto/employee.response.dto';
import { EmployeeFilterInput } from './dto/employee.input.dto';
import { EmployeeService } from './emplyee.service';

@Resolver(() => EmployeeResponse)
export class EmployeeResolver {
  constructor(private employeeService: EmployeeService) {}

  @Query(() => EmployeeResponse)
  async employees(
    @Args('filter', { nullable: true }) filter: EmployeeFilterInput = {},
    @Args('skip', { type: () => Int, nullable: true }) skip = 0,
    @Args('take', { type: () => Int, nullable: true }) take = 10,
  ): Promise<EmployeeResponse> {
    const result = await this.employeeService.getEmployees(filter, skip, take);
    console.log('🚀 ~ EmployeeResolver ~ result:', result);
    return result;
  }
}
