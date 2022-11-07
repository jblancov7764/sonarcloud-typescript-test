import { Column, Entity, JoinColumn, OneToMany, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Field, ObjectType } from '@nestjs/graphql';

import { RestaurantEntity } from '../restaurant/restaurant.entity';
import { ProductEntity } from '../products/product.entity';
import { RecipeEntity } from '../recipe/recipe.entity';
@ObjectType()
@Entity()
export class GastronomyEntity {

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
    country: string;

    @Field(type => [RestaurantEntity])
    @ManyToMany(() => RestaurantEntity, restaurant => restaurant.gastronomies)
    restaurants: RestaurantEntity[];

    @Field(type => [ProductEntity])
    @OneToMany(() => ProductEntity, (products) => products.gastronomy , { cascade: ['insert', 'update'] })
    @JoinColumn()
    products: ProductEntity[];

    @Field(type => [RecipeEntity])
    @OneToMany(() => RecipeEntity, recipe => recipe.gastronomy)
    recipes: RecipeEntity[];

}   
