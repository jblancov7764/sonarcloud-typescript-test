import { Field, InputType } from '@nestjs/graphql';
import {IsNotEmpty, IsString } from 'class-validator';
@InputType()
export class GastronomyDto {

    @Field()
    @IsNotEmpty()
    @IsString()
    name: string;
    
    @Field()
    @IsNotEmpty()
    @IsString()
    description: string;

    @Field()
    @IsNotEmpty()
    @IsString()
    country: string;
}
