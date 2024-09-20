import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class PositionResponse {
  @Field()
  Position: string;

  @Field()
  Status: boolean;
}
