/* eslint-disable prettier/prettier */
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule, Module } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { RecipeEntity } from './recipe.entity';
import { RecipeController } from './recipe.controller';
import { RecipeResolver } from './recipe.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([RecipeEntity]), CacheModule.register({
    ttl: 60,
  })],
  providers: [RecipeService, RecipeResolver],
  controllers: [RecipeController],
})
export class RecipeModule {}

/* archivo: src/recipe/recipe.module.ts */
