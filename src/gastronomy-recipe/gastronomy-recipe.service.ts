/* archivo: src/gastronomy-recipe/gastronomy-recipe.service.ts */
/* eslint-disable prettier/prettier */
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { GastronomyEntity } from '../gastronomy/gastronomy.entity';
import { RecipeEntity } from '../recipe/recipe.entity';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { Repository } from 'typeorm';


@Injectable()
export class GastronomyRecipeService {
    constructor(
        @InjectRepository(GastronomyEntity)
        private readonly gastronomyRepository: Repository<GastronomyEntity>,

        @InjectRepository(RecipeEntity)
        private readonly recipeRepository: Repository<RecipeEntity>,

        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache
    ) {}

    async addRecipeToGastronomy(gastronomyId: string, recipeId: string): Promise<GastronomyEntity> {
        const recipe: RecipeEntity = await this.recipeRepository.findOne({where: {id: recipeId}});
        if (!recipe)
          throw new BusinessLogicException("The recipe with the given id was not found", BusinessError.NOT_FOUND);
      
        const gastronomy: GastronomyEntity = await this.gastronomyRepository.findOne(
            {where: {id: gastronomyId}, relations: ["recipes"]}
            )
        if (!gastronomy)
          throw new BusinessLogicException("The gastronomy with the given id was not found", BusinessError.NOT_FOUND);
    
        gastronomy.recipes = [...gastronomy.recipes, recipe];
        return await this.gastronomyRepository.save(gastronomy);
    }

    async findRecipeByGastronomyIdRecipeId(gastronomyId: string, recipeId: string): Promise<RecipeEntity> {

        const recipe: RecipeEntity = await this.recipeRepository.findOne({where: {id: recipeId}});
       if (!recipe)
         throw new BusinessLogicException("The recipe with the given id was not found", BusinessError.NOT_FOUND)
      
       const gastronomy: GastronomyEntity = await this.gastronomyRepository.findOne({where: {id: gastronomyId}, relations: ["recipes"]});
       if (!gastronomy)
         throw new BusinessLogicException("The gastronomy with the given id was not found", BusinessError.NOT_FOUND)
  
       const gastronomyRecipe: RecipeEntity = gastronomy.recipes.find(e => e.id === recipe.id);
  
       if (!gastronomyRecipe)
         throw new BusinessLogicException("The recipe with the given id is not associated to the gastronomy", BusinessError.PRECONDITION_FAILED)
  
       return gastronomyRecipe;
    }

    async findRecipesByGastronomyId(gastronomyId: string): Promise<RecipeEntity[]> {
      const cached: GastronomyEntity = await this.cacheManager.get<GastronomyEntity>(gastronomyId);
      if(!cached){
        const gastronomy: GastronomyEntity = await this.gastronomyRepository.findOne(
          {where: {id: gastronomyId}, relations: ["recipes"]}
          )
        if (!gastronomy)
          throw new BusinessLogicException("The gastronomy with the given id was not found", BusinessError.NOT_FOUND);
        await this.cacheManager.set<GastronomyEntity>(gastronomyId, gastronomy);
        return gastronomy.recipes;
    }
      return cached.recipes;
  }
    
    async associateRecipesGastronomy(gastronomyId: string, recipes: RecipeEntity[]): Promise<GastronomyEntity> {
        const gastronomy: GastronomyEntity = await this.gastronomyRepository.findOne({where: {id: gastronomyId}, relations: ["recipes"]});
    
        if (!gastronomy)
          throw new BusinessLogicException("The gastronomy with the given id was not found", BusinessError.NOT_FOUND)
    
        for (let i = 0; i < recipes.length; i++) {
          const recipe: RecipeEntity = await this.recipeRepository.findOne({where: {id: recipes[i].id}});
          if (!recipe)
            throw new BusinessLogicException("The recipe with the given id was not found", BusinessError.NOT_FOUND)
        }
    
        gastronomy.recipes = recipes;
        return await this.gastronomyRepository.save(gastronomy);
    }

    async deleteRecipeOfGastronomy(gastronomyId: string, recipeId: string){

        const gastronomy: GastronomyEntity = await this.validate(gastronomyId, recipeId);
   
        gastronomy.recipes = gastronomy.recipes.filter(r => r.id !== recipeId);

        await this.gastronomyRepository.save(gastronomy);
    }

    async validate(gastronomyId: string, recipeId: string): Promise<GastronomyEntity> {
      const recipe: RecipeEntity = await this.recipeRepository.findOne({where: {id: recipeId}});
      if (!recipe)
        throw new BusinessLogicException("The recipe with the given id was not found", BusinessError.NOT_FOUND);
     
      const gastronomy: GastronomyEntity = await this.gastronomyRepository.findOne(
          {where: {id: gastronomyId}, relations: ["recipes"]}
      )
      if (!gastronomy)
        throw new BusinessLogicException("The gastronomy with the given id was not found", BusinessError.NOT_FOUND);
 
      const gastronomyRecipe: RecipeEntity = gastronomy.recipes.find(r => r.id === recipe.id);
 
      if (!gastronomyRecipe)
        throw new BusinessLogicException("The recipe with the given id is not associated to the gastronomy", BusinessError.PRECONDITION_FAILED)
 
      return gastronomy;
  }

}

