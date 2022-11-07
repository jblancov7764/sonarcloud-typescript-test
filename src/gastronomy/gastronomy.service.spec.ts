import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';

import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { GastronomyService } from './gastronomy.service';
import { GastronomyEntity } from './gastronomy.entity';
import { CACHE_MANAGER } from '@nestjs/common';

const mockCachManager = {
  get : jest.fn(),
  set: jest.fn()
}

describe('GastronomyService', () => {
  let service: GastronomyService;
  let repository: Repository<GastronomyEntity>;
  let gastronomiesList: GastronomyEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [GastronomyService, {
        provide : CACHE_MANAGER,
        useValue: mockCachManager,
      }],
    }).compile();

    service = module.get<GastronomyService>(GastronomyService);
    repository = module.get<Repository<GastronomyEntity>>(getRepositoryToken(GastronomyEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    gastronomiesList = [];
    for(let i = 0; i < 5; i++){
        const gastronomy: GastronomyEntity = await repository.save({
        name: faker.name.fullName(),
        description: faker.lorem.sentence(),
        country: faker.address.country(),
        products: null
        });
        gastronomiesList.push(gastronomy)
   }
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all gastronomies', async () => {
    const gastronomies: GastronomyEntity[] = await service.findAll();
    expect(gastronomies).not.toBeNull();
    expect(gastronomies).toHaveLength(gastronomiesList.length);
  });

  it('findOne should return a gastronomy by id', async () => {
    const storedGastronomy: GastronomyEntity = gastronomiesList[0];
    const gastronomy: GastronomyEntity = await service.findOne(storedGastronomy.id);
    expect(gastronomy).not.toBeNull();
    expect(gastronomy.name).toEqual(storedGastronomy.name)
    expect(gastronomy.description).toEqual(storedGastronomy.description)
    expect(gastronomy.country).toEqual(storedGastronomy.country)
  });

  it('findOne should throw an exception for an invalid gastronomy', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "The gastronomy with the given id was not found")
  });

  it('create should return a new gastronomy', async () => {
    const gastronomy: GastronomyEntity = {
      id: "",
      name: faker.name.fullName(),
      description: faker.lorem.sentence(),
      country: faker.address.country(),
      restaurants: [],
      products: [],
      recipes: []
    }

    const newGastronomy: GastronomyEntity = await service.create(gastronomy);
    expect(newGastronomy).not.toBeNull();

    const storedGastronomy: GastronomyEntity = await repository.findOne({where: {id: newGastronomy.id}})
    expect(storedGastronomy).not.toBeNull();
    expect(storedGastronomy.name).toEqual(newGastronomy.name)
    expect(storedGastronomy.description).toEqual(newGastronomy.description)
    expect(storedGastronomy.country).toEqual(newGastronomy.country)
  });

  it('update should modify a gastronomy', async () => {
    const gastronomy: GastronomyEntity  = gastronomiesList[0];
    gastronomy.name = "New name";
    gastronomy.country = "New Country";
  
    const updatedGastronomy: GastronomyEntity = await service.update(gastronomy.id, gastronomy);
    expect(updatedGastronomy).not.toBeNull();
  
    const storedGastronomy: GastronomyEntity = await repository.findOne({ where: { id: gastronomy.id } })
    expect(storedGastronomy).not.toBeNull();
    expect(storedGastronomy.name).toEqual(gastronomy.name)
    expect(storedGastronomy.country).toEqual(gastronomy.country)
  });

  it('update should throw an exception for an invalid gastronomy', async () => {
    const gastronomy: GastronomyEntity  = gastronomiesList[0];
    gastronomy.name = "New name";
    gastronomy.country = "New Country";

    await expect(() => service.update("0", gastronomy)).rejects.toHaveProperty("message", "The gastronomy with the given id was not found")
  });

  it('delete should remove a gastronomy', async () => {
    const gastronomy: GastronomyEntity = gastronomiesList[0];
    await service.delete(gastronomy.id);
    const deletedgastronomy: GastronomyEntity = await repository.findOne({ where: { id: gastronomy.id } })
    expect(deletedgastronomy).toBeNull();
  });

  it('delete should throw an exception for an invalid gastronomy', async () => {
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "The gastronomy with the given id was not found")
  });
});
