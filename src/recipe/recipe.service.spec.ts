/* eslint-disable prettier/prettier */
/*archivo src/recipe/recipe.service.spec.ts*/

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { RecipeService } from './recipe.service';
import { RecipeEntity } from './recipe.entity';

import { faker } from '@faker-js/faker';

import { CACHE_MANAGER } from '@nestjs/common';

const mockCachManager = {
  get : jest.fn(),
  set: jest.fn()
}

describe('RecipeService', () => {
  let service: RecipeService;
  let repository: Repository<RecipeEntity>;
  let recipesList: RecipeEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [RecipeService, {
        provide : CACHE_MANAGER,
        useValue: mockCachManager,
      }],
    }).compile();

    service = module.get<RecipeService>(RecipeService);
    repository = module.get<Repository<RecipeEntity>>(getRepositoryToken(RecipeEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    recipesList = [];
    for(let i = 0; i < 5; i++){
        const recipe: RecipeEntity = await repository.save({
        name: faker.company.name(), 
        description: faker.lorem.sentence(), 
        photo: faker.image.imageUrl(), 
        steps: faker.lorem.sentence(), 
        video: faker.image.imageUrl()})
        recipesList.push(recipe);
    }
  }
    
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all recipes', async () => {
    const recipes: RecipeEntity[] = await service.findAll();
    expect(recipes).not.toBeNull();
    expect(recipes).toHaveLength(recipesList.length);
  });

  it('findOne should return a recipe by id', async () => {
    const storedrecipe: RecipeEntity = recipesList[0];
    const recipe: RecipeEntity = await service.findOne(storedrecipe.id);
    expect(recipe).not.toBeNull();
    expect(recipe.name).toEqual(storedrecipe.name)
    expect(recipe.description).toEqual(storedrecipe.description)
    expect(recipe.photo).toEqual(storedrecipe.photo)
    expect(recipe.steps).toEqual(storedrecipe.steps)
    expect(recipe.video).toEqual(storedrecipe.video)
  });

  it('findOne should throw an exception for an invalid recipe', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "The recipe with the given id was not found")
  });

  it('create should return a new recipe', async () => {
    const recipe: RecipeEntity = {
      id: "",
      name: faker.company.name(), 
      description: faker.lorem.sentence(), 
      photo: faker.image.imageUrl(), 
      steps: faker.address.city(), 
      video: faker.image.imageUrl(),
      gastronomy: null
    }

    const newrecipe: RecipeEntity = await service.create(recipe);
    expect(newrecipe).not.toBeNull();

    const storedrecipe: RecipeEntity = await repository.findOne({where: {id: newrecipe.id}})
    expect(storedrecipe).not.toBeNull();
    expect(storedrecipe.name).toEqual(newrecipe.name)
    expect(storedrecipe.description).toEqual(newrecipe.description)
    expect(storedrecipe.photo).toEqual(newrecipe.photo)
    expect(storedrecipe.steps).toEqual(newrecipe.steps)
    expect(storedrecipe.video).toEqual(newrecipe.video)
  });

  it('update should modify a recipe', async () => {
    const recipe: RecipeEntity = recipesList[0];
    recipe.name = "New name";
    recipe.photo = "New photo";
  
    const updatedrecipe: RecipeEntity = await service.update(recipe.id, recipe);
    expect(updatedrecipe).not.toBeNull();
  
    const storedrecipe: RecipeEntity = await repository.findOne({ where: { id: recipe.id } })
    expect(storedrecipe).not.toBeNull();
    expect(storedrecipe.name).toEqual(recipe.name)
    expect(storedrecipe.photo).toEqual(recipe.photo)
  });
 
  it('update should throw an exception for an invalid recipe', async () => {
    let recipe: RecipeEntity = recipesList[0];
    recipe = {
      ...recipe, name: "New name", photo: "New photo"
    }
    await expect(() => service.update("0", recipe)).rejects.toHaveProperty("message", "The recipe with the given id was not found")
  });

  it('delete should remove a recipe', async () => {
    const recipe: RecipeEntity = recipesList[0];
    await service.delete(recipe.id);
  
    const deletedrecipe: RecipeEntity = await repository.findOne({ where: { id: recipe.id } })
    expect(deletedrecipe).toBeNull();
  });

  it('delete should throw an exception for an invalid recipe', async () => {
    const recipe: RecipeEntity = recipesList[0];
    await service.delete(recipe.id);
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "The recipe with the given id was not found")
  });
});
/*archivo src/recipe/recipe.service.spec.ts*/