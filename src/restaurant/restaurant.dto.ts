import { Field, InputType } from '@nestjs/graphql';
import {IsDate, IsNotEmpty, IsNumber, IsString} from 'class-validator';
@InputType()
export class RestaurantDto {

@Field()
 @IsString()
 @IsNotEmpty()
 readonly name: string;
 
 @Field()
 @IsString()
 @IsNotEmpty()
 readonly city: string;

 @Field()
 @IsString()
 @IsNotEmpty()
 readonly country: string;
 
 @Field()
 @IsNumber()
 @IsNotEmpty()
 readonly michellinStars: number;

 @Field()
 @IsDate()
 @IsNotEmpty()
 readonly lastMichellinStarDate: Date;
}