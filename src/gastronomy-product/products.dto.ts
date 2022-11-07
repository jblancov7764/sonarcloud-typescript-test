import { IsNotEmpty, IsString } from "class-validator";
import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class ProductsDto {

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly id: string;

}