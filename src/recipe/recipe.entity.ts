/* eslint-disable prettier/prettier */
/* archivo: src/recipe/recipe.entity.ts */
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GastronomyEntity } from './../gastronomy/gastronomy.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class RecipeEntity {
   @Field()
   @PrimaryGeneratedColumn('uuid')
   id: string;

   @Field()
   @Column()
   name: string;
   
   @Field()
   @Column()
   description: string;
   
   @Field()
   @Column()
   photo: string;
   
   @Field()
   @Column()
   steps: string;
   
   @Field()
   @Column()
   video: string;

   @Field(type => [GastronomyEntity])
   @ManyToOne(() => GastronomyEntity, gastronomy => gastronomy.recipes)
   gastronomy: GastronomyEntity;

}

/* archivo: src/recipe/recipe.entity.ts */
