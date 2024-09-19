import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class EmployeeFilterInput {
  @Field(() => String, { nullable: true })
  Name?: string;

  @Field(() => String, { nullable: true })
  FirstName?: string;

  @Field(() => String, { nullable: true })
  LastName?: string;

  @Field(() => String, { nullable: true })
  Position?: string;

  @Field(() => Boolean, { nullable: true })
  Status?: boolean;
}
