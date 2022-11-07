import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { RestaurantEntity } from './restaurant.entity';
import { RestaurantService } from './restaurant.service';
import { CACHE_MANAGER } from '@nestjs/common';
import { faker } from '@faker-js/faker';

const mockCachManager = {
  get : jest.fn(),
  set: jest.fn()
}

describe('RestaurantService', () => {
  let service: RestaurantService;
  let repository: Repository<RestaurantEntity>;
  let restaurantsList: RestaurantEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [RestaurantService, {
        provide : CACHE_MANAGER,
        useValue: mockCachManager,
      }],
    }).compile();

    service = module.get<RestaurantService>(RestaurantService);
    repository = module.get<Repository<RestaurantEntity>>(getRepositoryToken(RestaurantEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    restaurantsList = [];
    for(let i = 0; i < 5; i++){
        const restaurant: RestaurantEntity = await repository.save({
        name: faker.name.fullName(),
        description: faker.lorem.sentence(),
        city: faker.address.city(),
        country: faker.address.country(),
        michellinStars: parseInt(faker.random.numeric(1)),
        lastMichellinStarDate: faker.date.past(10)
        });
        restaurantsList.push(restaurant)
   }
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all restaurants', async () => {
    const restaurants: RestaurantEntity[] = await service.findAll();
    expect(restaurants).not.toBeNull();
    expect(restaurants).toHaveLength(restaurantsList.length);
  });

  it('findOne should return a restaurant by id', async () => {
    const storedRestaurant: RestaurantEntity = restaurantsList[0];
    const restaurant: RestaurantEntity = await service.findOne(storedRestaurant.id);
    expect(restaurant).not.toBeNull();
    expect(restaurant.name).toEqual(storedRestaurant.name)
    expect(restaurant.city).toEqual(storedRestaurant.city)
    expect(restaurant.country).toEqual(storedRestaurant.country)
  });

  it('findOne should throw an exception for an invalid restaurant', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "The restaurant with the given id was not found")
  });

  it('create should return a new restaurant', async () => {
    const restaurant: RestaurantEntity = {
      id: "",
      name: faker.name.fullName(),
      city: faker.lorem.sentence(),
      country: faker.address.country(),
      michellinStars: parseInt(faker.random.numeric(1)),
      lastMichellinStarDate: faker.date.past(10),
      gastronomies : []
    }

    const newRestaurant: RestaurantEntity = await service.create(restaurant);
    expect(newRestaurant).not.toBeNull();

    const storedRestaurant: RestaurantEntity = await repository.findOne({where: {id: newRestaurant.id}})
    expect(storedRestaurant).not.toBeNull();
    expect(storedRestaurant.name).toEqual(newRestaurant.name)
    expect(storedRestaurant.city).toEqual(newRestaurant.city)
    expect(storedRestaurant.country).toEqual(newRestaurant.country)
  });

  it('update should modify a restaurant', async () => {
    const restaurant: RestaurantEntity  = restaurantsList[0];
    restaurant.name = "New name";
    restaurant.country = "New Country";
  
    const updatedRestaurant: RestaurantEntity = await service.update(restaurant.id, restaurant);
    expect(updatedRestaurant).not.toBeNull();
  
    const storedRestaurant: RestaurantEntity = await repository.findOne({ where: { id: restaurant.id } })
    expect(storedRestaurant).not.toBeNull();
    expect(storedRestaurant.name).toEqual(restaurant.name)
    expect(storedRestaurant.country).toEqual(restaurant.country)
  });

  it('update should throw an exception for an invalid restaurant', async () => {
    const restaurant: RestaurantEntity  = restaurantsList[0];
    restaurant.name = "New name";
    restaurant.country = "New Country";

    await expect(() => service.update("0", restaurant)).rejects.toHaveProperty("message", "The restaurant with the given id was not found")
  });

  it('delete should remove a restaurant', async () => {
    const restaurant: RestaurantEntity = restaurantsList[0];
    await service.delete(restaurant.id);
  
    const deletedRestaurant: RestaurantEntity = await repository.findOne({ where: { id: restaurant.id } })
    expect(deletedRestaurant).toBeNull();
  });

  it('delete should throw an exception for an invalid restaurant', async () => {
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "The restaurant with the given id was not found")
  });
  
});