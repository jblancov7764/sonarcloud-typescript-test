/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';

import { GastronomyEntity } from '../gastronomy/gastronomy.entity';
import { RecipeEntity } from '../recipe/recipe.entity';
import { GastronomyRecipeService } from './gastronomy-recipe.service';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';

import { CACHE_MANAGER } from '@nestjs/common';

const mockCachManager = {
  get : jest.fn(),
  set: jest.fn()
}

describe('GastronomyRecipeService', () => {
  let service: GastronomyRecipeService;
  let gastronomyRepository: Repository<GastronomyEntity>;
  let recipeRepository: Repository<RecipeEntity>;
  let gastronomy: GastronomyEntity;
  let recipeList: RecipeEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [GastronomyRecipeService, {
        provide : CACHE_MANAGER,
        useValue: mockCachManager,
      }],
    }).compile();

    service = module.get<GastronomyRecipeService>(GastronomyRecipeService);
    gastronomyRepository = module.get<Repository<GastronomyEntity>>(getRepositoryToken(GastronomyEntity));
    recipeRepository = module.get<Repository<RecipeEntity>>(getRepositoryToken(RecipeEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    recipeRepository.clear();
    gastronomyRepository.clear();

    recipeList = [];
    for(let i = 0; i < 5; i++){
      const recipe: RecipeEntity = await recipeRepository.save({
        name: faker.company.name(), 
        description: faker.lorem.sentence(), 
        photo: faker.image.imageUrl(), 
        steps: faker.lorem.sentence(), 
        video: faker.image.imageUrl()
      })
        recipeList.push(recipe);
    }

    gastronomy = await gastronomyRepository.save({
      name: faker.name.fullName(),
      description: faker.lorem.sentence(),
      country: faker.address.country(),
      recipes: recipeList
      })
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addRecipeToGastronomy should add a recipe to a gastronomy', async () => {
    const newRecipe: RecipeEntity = await recipeRepository.save({
      name: faker.company.name(), 
      description: faker.lorem.sentence(), 
      photo: faker.image.imageUrl(), 
      steps: faker.lorem.sentence(), 
      video: faker.image.imageUrl()
    });

    const newGastronomy = await gastronomyRepository.save({
      name: faker.name.fullName(),
      description: faker.lorem.sentence(),
      country: faker.address.country(),
    })
 
    const result: GastronomyEntity = await service.addRecipeToGastronomy(newGastronomy.id, newRecipe.id);
   
    expect(result.recipes.length).toBe(1);
    expect(result.recipes[0]).not.toBeNull();
    expect(result.recipes[0].name).toBe(newRecipe.name)
    expect(result.recipes[0].description).toBe(newRecipe.description)
    expect(result.recipes[0].photo).toBe(newRecipe.photo)
    expect(result.recipes[0].steps).toBe(newRecipe.steps)
    expect(result.recipes[0].video).toBe(newRecipe.video)
  });

  it('addRecipeToGastronomy should thrown exception for an invalid recipe', async () => {

    const newGastronomy = await gastronomyRepository.save({
      name: faker.name.fullName(),
      description: faker.lorem.sentence(),
      country: faker.address.country(),
    });
 
    await expect(() => service.addRecipeToGastronomy(newGastronomy.id, "0")).rejects.toHaveProperty("message", "The recipe with the given id was not found");
  });

  it('addRecipeToGastronomy should thrown exception for an invalid gastronomy', async () => {
    const newRecipe: RecipeEntity = await recipeRepository.save({
      name: faker.company.name(), 
      description: faker.lorem.sentence(), 
      photo: faker.image.imageUrl(), 
      steps: faker.lorem.sentence(), 
      video: faker.image.imageUrl()
    });

    await expect(() => service.addRecipeToGastronomy("0", newRecipe.id)).rejects.toHaveProperty("message", "The gastronomy with the given id was not found");
  });

  it('findRecipeByGastronomyIdRecipeId should return recipe of the gastronomy', async () => {
    const recipe: RecipeEntity = recipeList[0];
    const storedRecipe: RecipeEntity = await service.findRecipeByGastronomyIdRecipeId(gastronomy.id, recipe.id);

    expect(storedRecipe).not.toBeNull();
    expect(storedRecipe.name).toBe(recipe.name);
    expect(storedRecipe.description).toBe(recipe.description);
    expect(storedRecipe.photo).toBe(recipe.photo);
    expect(storedRecipe.steps).toBe(recipe.steps);
    expect(storedRecipe.video).toBe(recipe.video);
  });

  it('findRecipeByGastronomyIdRecipeId should throw an exception for an invalid recipe', async () => {
    await expect(()=> service.findRecipeByGastronomyIdRecipeId(gastronomy.id, "0")).rejects.toHaveProperty("message", "The recipe with the given id was not found");
  });

  it('findRecipeByGastronomyIdRecipeId should throw an exception for an invalid gastronomy', async () => {
    const recipe: RecipeEntity = recipeList[0];
    await expect(()=> service.findRecipeByGastronomyIdRecipeId("0", recipe.id)).rejects.toHaveProperty("message", "The gastronomy with the given id was not found");
  });

  it('findRecipeByGastronomyIdRecipeId should throw an exception for a recipe not associated to the gastronomy', async () => {
    const newRecipe: RecipeEntity = await recipeRepository.save({
      name: faker.company.name(), 
      description: faker.lorem.sentence(), 
      photo: faker.image.imageUrl(), 
      steps: faker.lorem.sentence(), 
      video: faker.image.imageUrl()
    });
 
    await expect(()=> service.findRecipeByGastronomyIdRecipeId(gastronomy.id, newRecipe.id)).rejects.toHaveProperty("message", "The recipe with the given id is not associated to the gastronomy");
  });

  it('findRecipesByGastronomyId should return recipes by gastronomy', async ()=>{
    const recipes: RecipeEntity[] = await service.findRecipesByGastronomyId(gastronomy.id);
    expect(recipes.length).toBe(recipeList.length)
  });

  it('findRecipesByGastronomyId should throw an exception for an invalid gastronomy', async () => {
    await expect(()=> service.findRecipesByGastronomyId("0")).rejects.toHaveProperty("message", "The gastronomy with the given id was not found");
  });

  it('associateRecipesGastronomy should update recipes list for a gastronomy', async () => {
    const newRecipe: RecipeEntity = await recipeRepository.save({
      name: faker.company.name(), 
      description: faker.lorem.sentence(), 
      photo: faker.image.imageUrl(), 
      steps: faker.lorem.sentence(), 
      video: faker.image.imageUrl()
    });
 
    const updatedGastronomy: GastronomyEntity = await service.associateRecipesGastronomy(gastronomy.id, [newRecipe]);
    expect(updatedGastronomy.recipes.length).toBe(1);
    
    expect(updatedGastronomy.recipes[0].name).toBe(newRecipe.name);
    expect(updatedGastronomy.recipes[0].description).toBe(newRecipe.description);
    expect(updatedGastronomy.recipes[0].photo).toBe(newRecipe.photo);
    expect(updatedGastronomy.recipes[0].steps).toBe(newRecipe.steps);
    expect(updatedGastronomy.recipes[0].video).toBe(newRecipe.video);
  });

  it('associateRecipesGastronomy should throw an exception for an invalid gastronomy', async () => {
    const newRecipe: RecipeEntity = await recipeRepository.save({
      name: faker.company.name(), 
      description: faker.lorem.sentence(), 
      photo: faker.image.imageUrl(), 
      steps: faker.lorem.sentence(), 
      video: faker.image.imageUrl()
    });
 
    await expect(()=> service.associateRecipesGastronomy("0", [newRecipe])).rejects.toHaveProperty("message", "The gastronomy with the given id was not found");
  });

  it('associateRecipesGastronomy should throw an exception for an invalid artwork', async () => {
    const newRecipe: RecipeEntity= recipeList[0];
    newRecipe.id = "0";
 
    await expect(()=> service.associateRecipesGastronomy(gastronomy.id, [newRecipe])).rejects.toHaveProperty("message", "The recipe with the given id was not found");
  });

  it('deleteRecipeOfGastronomy should remove a recipe from a gastronomy', async () => {
    const recipe: RecipeEntity = recipeList[0];
   
    await service.deleteRecipeOfGastronomy(gastronomy.id, recipe.id);
 
    const storedGastronomy: GastronomyEntity = await gastronomyRepository.findOne({where: {id: gastronomy.id}, relations: ["recipes"]});
    const deletedRecipe: RecipeEntity = storedGastronomy.recipes.find(r => r.id === recipe.id);
 
    expect(deletedRecipe).toBeUndefined();
 
  });

  it('deleteRecipeOfGastronomy should throw an exception for an invalid recipe', async () => {
    await expect(()=> service.deleteRecipeOfGastronomy(gastronomy.id, "0")).rejects.toHaveProperty("message", "The recipe with the given id was not found");
  });

  it('deleteRecipeOfGastronomy should throw an exception for an invalid gastronomy', async () => {
    const recipe: RecipeEntity = recipeList[0];

    await expect(()=> service.deleteRecipeOfGastronomy("0", recipe.id)).rejects.toHaveProperty("message", "The gastronomy with the given id was not found");
  });

  it('deleteRecipeOfGastronomy should throw an exception for a recipe not associated to the gastronomy', async () => {
    const newRecipe: RecipeEntity = await recipeRepository.save({
      name: faker.company.name(), 
      description: faker.lorem.sentence(), 
      photo: faker.image.imageUrl(), 
      steps: faker.lorem.sentence(), 
      video: faker.image.imageUrl()
    });
 
    await expect(()=> service.deleteRecipeOfGastronomy(gastronomy.id, newRecipe.id)).rejects.toHaveProperty("message", "The recipe with the given id is not associated to the gastronomy");
  });

});
