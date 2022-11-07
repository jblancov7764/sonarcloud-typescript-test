import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';

import { GastronomyEntity } from '../gastronomy/gastronomy.entity';
import { RestaurantEntity } from '../restaurant/restaurant.entity';
import { GastronomyRestaurantService } from './gastronomy-restaurant.service';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { CACHE_MANAGER } from '@nestjs/common';

const mockCachManager = {
  get : jest.fn(),
  set: jest.fn()
}

describe('GastronomyRestaurantService', () => {
  let service: GastronomyRestaurantService;
  let gastronomyRepository: Repository<GastronomyEntity>;
  let restaurantRepository: Repository<RestaurantEntity>;
  let gastronomy: GastronomyEntity;
  let restaurantsList : RestaurantEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [GastronomyRestaurantService, {
        provide : CACHE_MANAGER,
        useValue: mockCachManager,
      }],
    }).compile();

    service = module.get<GastronomyRestaurantService>(GastronomyRestaurantService);
    gastronomyRepository = module.get<Repository<GastronomyEntity>>(getRepositoryToken(GastronomyEntity));
    restaurantRepository = module.get<Repository<RestaurantEntity>>(getRepositoryToken(RestaurantEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    gastronomyRepository.clear();
    restaurantRepository.clear();
    restaurantsList = [];
    for(let i = 0; i < 5; i++){
        const restaurant: RestaurantEntity = await restaurantRepository.save({
          name: faker.name.fullName(),
          description: faker.lorem.sentence(),
          city: faker.address.city(),
          country: faker.address.country(),
          michellinStars: parseInt(faker.random.numeric(1)),
          lastMichellinStarDate: faker.date.past(10),
        });
        restaurantsList.push(restaurant)
    }

    gastronomy = await gastronomyRepository.save({
    name: faker.name.fullName(),
    description: faker.lorem.sentence(),
    country: faker.address.country(),
    restaurants: restaurantsList
    });
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addRestaurantToGastronomy should add a restaurant to a gastronomy', async () => {
    const newRestaurant: RestaurantEntity = await restaurantRepository.save({
      name: faker.name.fullName(),
      description: faker.lorem.sentence(),
      city: faker.address.city(),
      country: faker.address.country(),
      michellinStars: parseInt(faker.random.numeric(1)),
      lastMichellinStarDate: faker.date.past(10)
    });

    const newGastronomy = await gastronomyRepository.save({
      name: faker.name.fullName(),
      description: faker.lorem.sentence(),
      country: faker.address.country(),
    });
 
    const result: GastronomyEntity = await service.addRestaurantToGastronomy(newGastronomy.id, newRestaurant.id);
   
    expect(result.restaurants.length).toBe(1);
    expect(result.restaurants[0]).not.toBeNull();
    expect(result.restaurants[0].name).toBe(newRestaurant.name);
  });

  it('addRestaurantToGastronomy should thrown exception for an invalid restaurant', async () => {

    const newGastronomy = await gastronomyRepository.save({
      name: faker.name.fullName(),
      description: faker.lorem.sentence(),
      country: faker.address.country(),
    });
 
    await expect(() => service.addRestaurantToGastronomy(newGastronomy.id, "0")).rejects.toHaveProperty("message", "The restaurant with the given id was not found");
  });

  it('addRestaurantToGastronomy should thrown exception for an invalid gastronomy', async () => {
    const newRestaurant: RestaurantEntity = await restaurantRepository.save({
      name: faker.name.fullName(),
      description: faker.lorem.sentence(),
      city: faker.address.city(),
      country: faker.address.country(),
      michellinStars: parseInt(faker.random.numeric(1)),
      lastMichellinStarDate: faker.date.past(10)
    });

    await expect(() => service.addRestaurantToGastronomy("0", newRestaurant.id)).rejects.toHaveProperty("message", "The gastronomy with the given id was not found");
  });

  it('findRestaurantByGastronomyIdIdRestaurantId should return restaurant of the gastronomy', async () => {
    const restaurant: RestaurantEntity = restaurantsList[0];
    const storedRestaurant: RestaurantEntity = await service.findRestaurantByGastronomyIdRestaurantId(gastronomy.id, restaurant.id);

    expect(storedRestaurant).not.toBeNull();
    expect(storedRestaurant.name).toBe(restaurant.name);
  });

  it('findRestaurantByGastronomyIdRestaurantId should throw an exception for an invalid restaurant', async () => {
    await expect(()=> service.findRestaurantByGastronomyIdRestaurantId(gastronomy.id, "0")).rejects.toHaveProperty("message", "The restaurant with the given id was not found");
  });

  it('findRestaurantByGastronomyIdRestaurantId should throw an exception for an invalid gastronomy', async () => {
    const restaurant: RestaurantEntity = restaurantsList[0];

    await expect(()=> service.findRestaurantByGastronomyIdRestaurantId("0", restaurant.id)).rejects.toHaveProperty("message", "The gastronomy with the given id was not found");
  });

  it('findRestaurantByGastronomyIdRestaurantId should throw an exception for a restaurant not associated to the gastronomy', async () => {
    const newRestaurant: RestaurantEntity = await restaurantRepository.save({
      name: faker.name.fullName(),
      description: faker.lorem.sentence(),
      city: faker.address.city(),
      country: faker.address.country(),
      michellinStars: parseInt(faker.random.numeric(1)),
      lastMichellinStarDate: faker.date.past(10)
    });
 
    await expect(
      ()=> service.findRestaurantByGastronomyIdRestaurantId(gastronomy.id, newRestaurant.id)
      ).rejects.toHaveProperty("message", "The restaurant with the given id is not associated to the gastronomy");
  });

  it('findRestaurantsByGastronomyId should return restaurants of a  gastronomy', async ()=>{
    const restaurants: RestaurantEntity[] = await service.findRestaurantsByGastronomyId(gastronomy.id);
    expect(restaurants.length).toBe(restaurantsList.length)
  });

  it('findRestaurantsByGastronomyId should throw an exception for an invalid gastronomy', async () => {
    await expect(()=> service.findRestaurantsByGastronomyId("0")).rejects.toHaveProperty("message", "The gastronomy with the given id was not found");
  });

  it('associateRestaurantsGastronomy should update restaurants list for a gastronomy', async () => {
    const newRestaurant: RestaurantEntity = await restaurantRepository.save({
      name: faker.name.fullName(),
      description: faker.lorem.sentence(),
      city: faker.address.city(),
      country: faker.address.country(),
      michellinStars: parseInt(faker.random.numeric(1)),
      lastMichellinStarDate: faker.date.past(10)
    });
 
    const updatedGastronomy: GastronomyEntity = await service.associateRestaurantsGastronomy(gastronomy.id, [newRestaurant]);

    expect(updatedGastronomy.restaurants.length).toBe(1);
    expect(updatedGastronomy.restaurants[0].name).toBe(newRestaurant.name);
  });

  it('associateRestaurantsGastronomy should throw an exception for an invalid gastronomy', async () => {
    const newRestaurant: RestaurantEntity = await restaurantRepository.save({
      name: faker.name.fullName(),
      description: faker.lorem.sentence(),
      city: faker.address.city(),
      country: faker.address.country(),
      michellinStars: parseInt(faker.random.numeric(1)),
      lastMichellinStarDate: faker.date.past(10)
    });
 
    await expect(()=> service.associateRestaurantsGastronomy("0", [newRestaurant])).rejects.toHaveProperty("message", "The gastronomy with the given id was not found");
  });

  it('associateRestaurantsGastronomy should throw an exception for an invalid artwork', async () => {
    const newRestaurant: RestaurantEntity= restaurantsList[0];
    newRestaurant.id = "0";
 
    await expect(()=> service.associateRestaurantsGastronomy(gastronomy.id, [newRestaurant])).rejects.toHaveProperty("message", "The restaurant with the given id was not found");
  });

  it('deleteRestaurantoOfGastronomy should remove a resturant from a gastronomy', async () => {
    const restaurant: RestaurantEntity = restaurantsList[0];
   
    await service.deleteRestaurantoOfGastronomy(gastronomy.id, restaurant.id);
 
    const storedGastronomy: GastronomyEntity = await gastronomyRepository.findOne({where: {id: gastronomy.id}, relations: ["restaurants"]});
    const deletedRestaurant: RestaurantEntity = storedGastronomy.restaurants.find(r => r.id === restaurant.id);
 
    expect(deletedRestaurant).toBeUndefined();
 
  });

  it('deleteRestaurantoOfGastronomy should throw an exception for an invalid restaurant', async () => {
    await expect(()=> service.deleteRestaurantoOfGastronomy(gastronomy.id, "0")).rejects.toHaveProperty("message", "The restaurant with the given id was not found");
  });

  it('deleteRestaurantoOfGastronomy should throw an exception for an invalid gastronomy', async () => {
    const restaurant: RestaurantEntity = restaurantsList[0];

    await expect(()=> service.deleteRestaurantoOfGastronomy("0", restaurant.id)).rejects.toHaveProperty("message", "The gastronomy with the given id was not found");
  });

  it('deleteRestaurantoOfGastronomy should throw an exception for a restaurant not associated to the gastronomy', async () => {
    const newRestaurant: RestaurantEntity = await restaurantRepository.save({
      name: faker.name.fullName(),
      description: faker.lorem.sentence(),
      city: faker.address.city(),
      country: faker.address.country(),
      michellinStars: parseInt(faker.random.numeric(1)),
      lastMichellinStarDate: faker.date.past(10)
    });
 
    await expect(
      ()=> service.deleteRestaurantoOfGastronomy(gastronomy.id, newRestaurant.id)
      ).rejects.toHaveProperty("message", "The restaurant with the given id is not associated to the gastronomy");
  });

});
