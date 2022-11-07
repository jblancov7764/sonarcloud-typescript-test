/* eslint-disable prettier/prettier */
import { Field, InputType } from '@nestjs/graphql';
import {IsNotEmpty, IsString, IsUrl} from 'class-validator';

@InputType()
export class RecipeDto {

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
    readonly photo: string;
    
    @Field()
    @IsString()
    @IsNotEmpty()
    readonly steps: string;
    
    @Field()
    @IsUrl()
    @IsNotEmpty()
    readonly video: string;
}
/* archivo: src/recipe/recipe.dto.ts */