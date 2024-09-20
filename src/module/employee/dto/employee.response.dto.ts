/* eslint-disable prettier/prettier */
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Employee {
  @Field(() => ID)
  employeeId: string;

  @Field()
  Name: string;

  @Field()
  FirstName: string;

  @Field()
  LastName: string;

  @Field()
  Position: string;

  @Field()
  Status: boolean;
  @Field()
  createdAt: string;
  @Field()
  updatedAt: string;
}

@ObjectType()
export class EmployeeResponse {
  @Field(() => [Employee])
  employees: Employee[];

  @Field()
  total_count: number;
}
