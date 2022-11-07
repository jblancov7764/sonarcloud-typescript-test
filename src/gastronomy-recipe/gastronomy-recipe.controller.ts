/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { GastronomyRecipeService } from './gastronomy-recipe.service';
import { RecipeDto } from '../recipe/recipe.dto';
import { RecipeEntity } from '../recipe/recipe.entity';

@Controller('gastronomies')
@UseInterceptors(BusinessErrorsInterceptor)
export class GastronomyRecipeController {
   constructor(private readonly gastronomyRecipeService: GastronomyRecipeService){}

   @Post(':gastronomyId/recipes/:recipeId')
   async addRecipeGastronomy(@Param('gastronomyId') gastronomyId: string, @Param('artworkId') artworkId: string){
       return await this.gastronomyRecipeService.addRecipeToGastronomy(gastronomyId, artworkId);
   }

   @Get(':gastronomyId/recipes/:recipeId')
   async findRecipeByGastronomyIdRecipeId(@Param('gastronomyId') gastronomyId: string, @Param('artworkId') artworkId: string){
       return await this.gastronomyRecipeService.findRecipeByGastronomyIdRecipeId(gastronomyId, artworkId);
   }

   @Get(':gastronomyId/recipes')
   async findRecipesByGastronomyId(@Param('gastronomyId') gastronomyId: string){
       return await this.gastronomyRecipeService.findRecipesByGastronomyId(gastronomyId);
   }

   @Put(':gastronomyId/recipes')
   async associateRecipesGastronomy(@Body() recipesDto: RecipeDto[], @Param('gastronomyId') gastronomyId: string){
       const recipes = plainToInstance(RecipeEntity, recipesDto)
       return await this.gastronomyRecipeService.associateRecipesGastronomy(gastronomyId, recipes);
   }

   @Delete(':gastronomyId/recipes/:recipeId')
   @HttpCode(204)
   async deleteRecipeGastronomy(@Param('gastronomyId') gastronomyId: string, @Param('recipeId') recipeId: string){
       return await this.gastronomyRecipeService.deleteRecipeOfGastronomy(gastronomyId, recipeId);
   }
}