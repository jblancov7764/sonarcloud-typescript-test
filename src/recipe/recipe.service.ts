/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* archivo: src/recipe/recipe.service.ts */
import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { RecipeEntity } from './recipe.entity';

@Injectable()
export class RecipeService {
    
    cacheKey: string = "recipes";

    constructor(
        @InjectRepository(RecipeEntity)
        private readonly recipeRepository: Repository<RecipeEntity>,

        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache
    ){}

    async findAll(): Promise<RecipeEntity[]> {
        const cached: RecipeEntity[] = await this.cacheManager.get<RecipeEntity[]>(this.cacheKey);
      
       if(!cached){
           const recipes: RecipeEntity[] = await this.recipeRepository.find({ relations: ["gastronomy"] });
           await this.cacheManager.set(this.cacheKey, recipes);
           return recipes;
       }

       return cached;
       
    }

    async findOne(id: string): Promise<RecipeEntity> {
        const recipe: RecipeEntity = await this.recipeRepository.findOne({where: {id}} );
        if (!recipe)
          throw new BusinessLogicException("The recipe with the given id was not found", BusinessError.NOT_FOUND);
   
        return recipe;
    }

    async create(recipe: RecipeEntity): Promise<RecipeEntity> {
        return await this.recipeRepository.save(recipe);
    }

    async update(id: string, recipe: RecipeEntity): Promise<RecipeEntity> {
        const persistedrecipe: RecipeEntity = await this.recipeRepository.findOne({where:{id}});
        if (!persistedrecipe)
          throw new BusinessLogicException("The recipe with the given id was not found", BusinessError.NOT_FOUND);
        
        recipe.id = id; 
      
        return await this.recipeRepository.save(recipe);
    }

    async delete(id: string) {
        const recipe: RecipeEntity = await this.recipeRepository.findOne({where:{id}});
        if (!recipe)
          throw new BusinessLogicException("The recipe with the given id was not found", BusinessError.NOT_FOUND);
     
        await this.recipeRepository.remove(recipe);
    }

}
/* archivo: src/recipe/recipe.service.ts */