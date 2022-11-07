import { IsNotEmpty, IsString } from "class-validator";
import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class ProductDto {

 @Field()
 @IsString()
 @IsNotEmpty()
 readonly name: string;

 @Field()
 @IsString()
 @IsNotEmpty()
 readonly description: string;

 @Field()
 @IsString()
 @IsNotEmpty()
 readonly history: string;

 @Field()
 @IsString()
 @IsNotEmpty()
 readonly category: string;

}