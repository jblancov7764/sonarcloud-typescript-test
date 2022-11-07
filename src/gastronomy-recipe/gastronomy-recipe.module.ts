/* eslint-disable prettier/prettier */
import { RecipeEntity } from './../recipe/recipe.entity';
import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GastronomyEntity } from '../gastronomy/gastronomy.entity';
import { GastronomyRecipeService } from './gastronomy-recipe.service';
import { GastronomyRecipeController } from './gastronomy-recipe.controller';
import { GastronomyRecipeResolver } from './gastronomy-recipe.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([GastronomyEntity, RecipeEntity]), CacheModule.register({
    ttl: 60,
  })],
  providers: [GastronomyRecipeService, GastronomyRecipeResolver],
  controllers: [GastronomyRecipeController],
})
export class GastronomyRecipeModule {}
