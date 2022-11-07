import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';

import { RestaurantEntity } from '../restaurant/restaurant.entity';
import { GastronomyEntity } from '../gastronomy/gastronomy.entity';
import { RestaurantGastronomyService } from './restaurant-gastronomy.service';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { CACHE_MANAGER } from '@nestjs/common';

const mockCachManager = {
  get : jest.fn(),
  set: jest.fn()
}


describe('RestaurantGastronomyService', () => {
  let service: RestaurantGastronomyService;
  let restaurantRepository: Repository<RestaurantEntity>;
  let gastronomyRepository: Repository<GastronomyEntity>;
  let restaurant: RestaurantEntity;
  let gastronomiesList : GastronomyEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [RestaurantGastronomyService, {
        provide : CACHE_MANAGER,
        useValue: mockCachManager,
      }],
    }).compile();

    service = module.get<RestaurantGastronomyService>(RestaurantGastronomyService);
    restaurantRepository = module.get<Repository<RestaurantEntity>>(getRepositoryToken(RestaurantEntity));
    gastronomyRepository = module.get<Repository<GastronomyEntity>>(getRepositoryToken(GastronomyEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    restaurantRepository.clear();
    gastronomyRepository.clear();
    gastronomiesList = [];
    for(let i = 0; i < 5; i++){
        const gastronomy: GastronomyEntity = await gastronomyRepository.save({
          name: faker.name.fullName(),
          description: faker.lorem.sentence(),
          country: faker.address.country(),
        });
        gastronomiesList.push(gastronomy)
    }

    restaurant = await restaurantRepository.save({
      name: faker.name.fullName(),
      description: faker.lorem.sentence(),
      city: faker.address.city(),
      country: faker.address.country(),
      michellinStars: parseInt(faker.random.numeric(1)),
      lastMichellinStarDate: faker.date.past(10),
      gastronomies: gastronomiesList
    });
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addGastronomyToRestaurant should add a gastronomy to a restaurant', async () => {
    const newGastronomy: GastronomyEntity = await gastronomyRepository.save({
      name: faker.name.fullName(),
      description: faker.lorem.sentence(),
      country: faker.address.country(),
    });

    const newRestaurant = await restaurantRepository.save({
      name: faker.name.fullName(),
      description: faker.lorem.sentence(),
      city: faker.address.city(),
      country: faker.address.country(),
      michellinStars: parseInt(faker.random.numeric(1)),
      lastMichellinStarDate: faker.date.past(10)
    });
 
    const result: RestaurantEntity = await service.addGastronomyToRestaurant(newRestaurant.id, newGastronomy.id);
   
    expect(result.gastronomies.length).toBe(1);
    expect(result.gastronomies[0]).not.toBeNull();
    expect(result.gastronomies[0].name).toBe(newGastronomy.name);
  });

  it('addGastronomyToRestaurant should thrown exception for an invalid gastronomy', async () => {

    const newRestaurant = await restaurantRepository.save({
      name: faker.name.fullName(),
      description: faker.lorem.sentence(),
      city: faker.address.city(),
      country: faker.address.country(),
      michellinStars: parseInt(faker.random.numeric(1)),
      lastMichellinStarDate: faker.date.past(10)
    });
 
    await expect(() => service.addGastronomyToRestaurant(newRestaurant.id, "0")).rejects.toHaveProperty("message", "The gastronomy with the given id was not found");
  });

  it('addGastronomyToRestaurant should thrown exception for an invalid restaurant', async () => {
    const newGastronomy: GastronomyEntity = await gastronomyRepository.save({
      name: faker.name.fullName(),
      description: faker.lorem.sentence(),
      country: faker.address.country(),
    });

    await expect(() => service.addGastronomyToRestaurant("0", newGastronomy.id)).rejects.toHaveProperty("message", "The restaurant with the given id was not found");
  });

  it('findGastronomyByRestaurantIdGastronomyId should return gastronomy of the restaurant', async () => {
    const gastronomy: GastronomyEntity = gastronomiesList[0];
    const storedGastronomy: GastronomyEntity = await service.findGastronomyByRestaurantIdGastronomyId(restaurant.id, gastronomy.id);

    expect(storedGastronomy).not.toBeNull();
    expect(storedGastronomy.name).toBe(gastronomy.name);
  });

  it('findGastronomyByRestaurantIdGastronomyId should throw an exception for an invalid gastronomy', async () => {
    await expect(()=> service.findGastronomyByRestaurantIdGastronomyId(restaurant.id, "0")).rejects.toHaveProperty("message", "The gastronomy with the given id was not found");
  });

  it('findGastronomyByRestaurantIdGastronomyId should throw an exception for an invalid restaurant', async () => {
    const gastronomy: GastronomyEntity = gastronomiesList[0];

    await expect(()=> service.findGastronomyByRestaurantIdGastronomyId("0", gastronomy.id)).rejects.toHaveProperty("message", "The restaurant with the given id was not found");
  });

  it('findGastronomyByRestaurantIdGastronomyId should throw an exception for a gastronomy not associated to the restaurant', async () => {
    const newGastronomy: GastronomyEntity = await gastronomyRepository.save({
      name: faker.name.fullName(),
      description: faker.lorem.sentence(),
      country: faker.address.country(),
    });
 
    await expect(
      ()=> service.findGastronomyByRestaurantIdGastronomyId(restaurant.id, newGastronomy.id)
      ).rejects.toHaveProperty("message", "The gastronomy with the given id is not associated to the restaurant");
  });

  it('findGastronomiesByRestaurantId should return gastronomies of a  restaurant', async ()=>{
    const gastronomies: GastronomyEntity[] = await service.findGastronomiesByRestaurantId(restaurant.id);
    expect(gastronomies.length).toBe(gastronomiesList.length)
  });

  it('findGastronomiesByRestaurantId should throw an exception for an invalid restaurant', async () => {
    await expect(()=> service.findGastronomiesByRestaurantId("0")).rejects.toHaveProperty("message", "The restaurant with the given id was not found");
  });

  it('associateGastronomiesRestaurant should update gastronomies list for a restaurant', async () => {
    const newGastronomy: GastronomyEntity = await gastronomyRepository.save({
      name: faker.name.fullName(),
      description: faker.lorem.sentence(),
      country: faker.address.country(),
    });
 
    const updatedRestaurant: RestaurantEntity = await service.associateGastronomiesRestaurant(restaurant.id, [newGastronomy]);

    expect(updatedRestaurant.gastronomies.length).toBe(1);
    expect(updatedRestaurant.gastronomies[0].name).toBe(newGastronomy.name);
  });

  it('associateGastronomiesRestaurant should throw an exception for an invalid restaurant', async () => {
    const newGastronomy: GastronomyEntity = await gastronomyRepository.save({
      name: faker.name.fullName(),
      description: faker.lorem.sentence(),
      country: faker.address.country(),
    });
 
    await expect(()=> service.associateGastronomiesRestaurant("0", [newGastronomy])).rejects.toHaveProperty("message", "The restaurant with the given id was not found");
  });

  it('associateGastronomiesRestaurant should throw an exception for an invalid artwork', async () => {
    const newGastronomy: GastronomyEntity= gastronomiesList[0];
    newGastronomy.id = "0";
 
    await expect(()=> service.associateGastronomiesRestaurant(restaurant.id, [newGastronomy])).rejects.toHaveProperty("message", "The gastronomy with the given id was not found");
  });

  it('deleteGastronomyoOfRestaurant should remove a resturant from a restaurant', async () => {
    const gastronomy: GastronomyEntity = gastronomiesList[0];
   
    await service.deleteGastronomyOfRestaurant(restaurant.id, gastronomy.id);
 
    const storedRestaurant: RestaurantEntity = await restaurantRepository.findOne({where: {id: restaurant.id}, relations: ["gastronomies"]});
    const deletedGastronomy: GastronomyEntity = storedRestaurant.gastronomies.find(r => r.id === gastronomy.id);
 
    expect(deletedGastronomy).toBeUndefined();
 
  });

  it('deleteGastronomyoOfRestaurant should throw an exception for an invalid gastronomy', async () => {
    await expect(()=> service.deleteGastronomyOfRestaurant(restaurant.id, "0")).rejects.toHaveProperty("message", "The gastronomy with the given id was not found");
  });

  it('deleteGastronomyoOfRestaurant should throw an exception for an invalid restaurant', async () => {
    const gastronomy: GastronomyEntity = gastronomiesList[0];

    await expect(()=> service.deleteGastronomyOfRestaurant("0", gastronomy.id)).rejects.toHaveProperty("message", "The restaurant with the given id was not found");
  });

  it('deleteGastronomyoOfRestaurant should throw an exception for a gastronomy not associated to the restaurant', async () => {
    const newGastronomy: GastronomyEntity = await gastronomyRepository.save({
      name: faker.name.fullName(),
      description: faker.lorem.sentence(),
      country: faker.address.country(),
    });
 
    await expect(
      ()=> service.deleteGastronomyOfRestaurant(restaurant.id, newGastronomy.id)
      ).rejects.toHaveProperty("message", "The gastronomy with the given id is not associated to the restaurant");
  });

});
