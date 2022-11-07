/* eslint-disable prettier/prettier */
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { plainToInstance } from 'class-transformer';
import { RecipeDto } from 'src/recipe/recipe.dto';
import { GastronomyEntity } from '../gastronomy/gastronomy.entity';
import { RecipeEntity } from '../recipe/recipe.entity';

import { GastronomyRecipeService } from './gastronomy-recipe.service';

@Resolver()
export class GastronomyRecipeResolver {
    constructor(private gastronomyRecipeService: GastronomyRecipeService) {}

    @Query(() => [RecipeEntity])
    async recipesOfGastronomy(@Args('gastronomyId') gastronomyId: string): Promise<RecipeEntity[]> {
        return await this.gastronomyRecipeService.findRecipesByGastronomyId(gastronomyId);
    }

    @Query(() => RecipeEntity)
    async gastronomy(@Args('gastronomyId') gastronomyId: string, @Args('recipeId') recipeId: string): Promise<RecipeEntity> {
        return await this.gastronomyRecipeService.findRecipeByGastronomyIdRecipeId(gastronomyId, recipeId);
    }

    @Mutation(() => GastronomyEntity)
    async addRecipeToGastronomy(@Args('gastronomyId') gastronomyId: string, @Args('recipeId') recipeId: string): Promise<GastronomyEntity> {
        return await this.gastronomyRecipeService.addRecipeToGastronomy(gastronomyId, recipeId);
    }

    @Mutation(() => GastronomyEntity)
    async updateRecipesOfGastronomy(@Args('gastronomyId') gastronomyId: string, @Args({ name: 'recipes', type: () => [RecipeDto] }) recipes: RecipeDto[]): Promise<GastronomyEntity> {
        return await this.gastronomyRecipeService.associateRecipesGastronomy(gastronomyId, plainToInstance(RecipeEntity, recipes));
    }

    @Mutation(() => String)
    async deleteRecipeoOfGastronomy(@Args('gastronomyId') gastronomyId: string, @Args('recipeId') recipeId: string): Promise<string> {
        await this.gastronomyRecipeService.deleteRecipeOfGastronomy(gastronomyId, recipeId);
        return recipeId;
    }

}