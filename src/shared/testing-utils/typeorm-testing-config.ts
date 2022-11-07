/* eslint-disable prettier/prettier */
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantEntity } from '../../restaurant/restaurant.entity';
import { GastronomyEntity } from '../../gastronomy/gastronomy.entity';
import { ProductEntity } from '../../products/product.entity';
import { RecipeEntity } from '../../recipe/recipe.entity';


export const TypeOrmTestingConfig = () => [
 TypeOrmModule.forRoot({
   type: 'sqlite',
   database: ':memory:',
   dropSchema: true,
   entities: [GastronomyEntity, ProductEntity, RestaurantEntity, RecipeEntity],
   synchronize: true,
   keepConnectionAlive: true
 }),
 TypeOrmModule.forFeature([GastronomyEntity, ProductEntity, RestaurantEntity, RecipeEntity]),
];