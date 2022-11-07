/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ApolloDriver } from '@nestjs/apollo';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GastronomyModule } from './gastronomy/gastronomy.module';
import { GastronomyEntity } from './gastronomy/gastronomy.entity';
import { RestaurantModule } from './restaurant/restaurant.module';
import { RestaurantEntity } from './restaurant/restaurant.entity';
import { ProductModule } from './products/product.module';
import { ProductEntity } from './products/product.entity';
import { RecipeModule } from './recipe/recipe.module';
import { RecipeEntity } from './recipe/recipe.entity';
import { GastronomyProductModule } from './gastronomy-product/gastronomy-product.module';
import { GastronomyRecipeModule } from './gastronomy-recipe/gastronomy-recipe.module';
import { RestaurantGastronomyModule } from './restaurant-gastronomy/restaurant-gastronomy.module';
import { GastronomyRestaurantModule } from './gastronomy-restaurant/gastronomy-restaurant.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    GastronomyModule,
    GastronomyRestaurantModule,
    RestaurantModule,
    ProductModule,
    GastronomyProductModule,
    RecipeModule,
    RestaurantGastronomyModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'cultural-gastronomy',
      entities: [GastronomyEntity, ProductEntity, RestaurantEntity, RecipeEntity],
      dropSchema: true,
      synchronize: true,
      keepConnectionAlive: true,
    }),
    GastronomyRecipeModule,
    UserModule,
    AuthModule,
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      driver: ApolloDriver
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
