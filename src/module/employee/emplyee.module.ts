import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EmployeeResolver } from './employee.resolver';
import { GraphqlModule } from 'src/graphql.module';
import { EmployeeService } from './emplyee.service';

@Module({
  providers: [EmployeeResolver, EmployeeService],
  imports: [PrismaModule, GraphqlModule],
})
export class employeeModule {}
