import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { RestaurantEntity } from './restaurant.entity';

import { Cache } from 'cache-manager';

@Injectable()
export class RestaurantService {

    cacheKey: string = "restaurants";

    constructor(
        @InjectRepository(RestaurantEntity)
        private readonly restaurantRepository: Repository<RestaurantEntity>,

        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache
    ){}

    async findAll(): Promise<RestaurantEntity[]> {
        const cached: RestaurantEntity[] = await this.cacheManager.get<RestaurantEntity[]>(this.cacheKey);
        if(!cached){
            const restaurants : RestaurantEntity[] = await this.restaurantRepository.find({relations: ['gastronomies']});
            await this.cacheManager.set<RestaurantEntity[]>(this.cacheKey, restaurants);
            return restaurants;
        }
        return cached;
    }

    async findOne(id: string): Promise<RestaurantEntity> {
        const restaurant: RestaurantEntity = await this.restaurantRepository.findOne({where: {id}});
        if (!restaurant)
          throw new BusinessLogicException("The restaurant with the given id was not found", BusinessError.NOT_FOUND);
   
        return restaurant;
    }

    async create(restaurant: RestaurantEntity): Promise<RestaurantEntity> {
        return await this.restaurantRepository.save(restaurant);
    }

    async update(id: string, restaurant: RestaurantEntity): Promise<RestaurantEntity> {
        const persistedRestaurant: RestaurantEntity = await this.restaurantRepository.findOne({where:{id}});
        if (!persistedRestaurant)
          throw new BusinessLogicException("The restaurant with the given id was not found", BusinessError.NOT_FOUND);
       
        Object.assign(persistedRestaurant, restaurant);
       
        return await this.restaurantRepository.save(persistedRestaurant);
    }

    async delete(id: string) {
        const restaurant: RestaurantEntity = await this.restaurantRepository.findOne({where:{id}});
        if (!restaurant)
          throw new BusinessLogicException("The restaurant with the given id was not found", BusinessError.NOT_FOUND);
     
        await this.restaurantRepository.remove(restaurant);
    }
}
