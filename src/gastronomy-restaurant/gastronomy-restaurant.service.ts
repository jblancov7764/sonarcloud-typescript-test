import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';

import { GastronomyEntity } from '../gastronomy/gastronomy.entity';
import { RestaurantEntity } from '../restaurant/restaurant.entity';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { Repository } from 'typeorm';


@Injectable()
export class GastronomyRestaurantService {

    @InjectRepository(GastronomyEntity)
    private readonly gastronomyRepository: Repository<GastronomyEntity>
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepository: Repository<RestaurantEntity>

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache

    async addRestaurantToGastronomy(gastronomyId: string, restaurantId: string): Promise<GastronomyEntity> {
        const restaurant: RestaurantEntity = await this.restaurantRepository.findOne({where: {id: restaurantId}});
        if (!restaurant)
          throw new BusinessLogicException("The restaurant with the given id was not found", BusinessError.NOT_FOUND);
      
        const gastronomy: GastronomyEntity = await this.gastronomyRepository.findOne(
            {where: {id: gastronomyId}, relations: ["restaurants"]}
            )
        if (!gastronomy)
          throw new BusinessLogicException("The gastronomy with the given id was not found", BusinessError.NOT_FOUND);
    
        gastronomy.restaurants = [...gastronomy.restaurants, restaurant];
        return await this.gastronomyRepository.save(gastronomy);
    }

    async findRestaurantByGastronomyIdRestaurantId(gastronomyId: string, restaurantId: string): Promise<RestaurantEntity> {

        const gastronomy: GastronomyEntity = await this.validate(gastronomyId, restaurantId);
   
        return gastronomy.restaurants.find(r => r.id === restaurantId);
    }

    async findRestaurantsByGastronomyId(gastronomyId: string): Promise<RestaurantEntity[]> {
        const cached: GastronomyEntity = await this.cacheManager.get<GastronomyEntity>(gastronomyId);
        if(!cached){
          const gastronomy: GastronomyEntity = await this.gastronomyRepository.findOne(
            {where: {id: gastronomyId}, relations: ["restaurants"]}
            )
          if (!gastronomy)
            throw new BusinessLogicException("The gastronomy with the given id was not found", BusinessError.NOT_FOUND);
          await this.cacheManager.set<GastronomyEntity>(gastronomyId, gastronomy);
          return gastronomy.restaurants;
      }
        return cached.restaurants;
    }
    
    async associateRestaurantsGastronomy(gastronomyId: string, restaurants: RestaurantEntity[]): Promise<GastronomyEntity> {
        const gastronomy: GastronomyEntity = await this.gastronomyRepository.findOne({where: {id: gastronomyId}, relations: ["restaurants"]});
    
        if (!gastronomy)
          throw new BusinessLogicException("The gastronomy with the given id was not found", BusinessError.NOT_FOUND)
    
        for (let i = 0; i < restaurants.length; i++) {
          const restaurant: RestaurantEntity = await this.restaurantRepository.findOne({where: {id: restaurants[i].id}});
          if (!restaurant)
            throw new BusinessLogicException("The restaurant with the given id was not found", BusinessError.NOT_FOUND)
        }
    
        gastronomy.restaurants = restaurants;
        return await this.gastronomyRepository.save(gastronomy);
    }

    async deleteRestaurantoOfGastronomy(gastronomyId: string, restaurantId: string){

        const gastronomy: GastronomyEntity = await this.validate(gastronomyId, restaurantId);
   
        gastronomy.restaurants = gastronomy.restaurants.filter(r => r.id !== restaurantId);

        await this.gastronomyRepository.save(gastronomy);
    }

    async validate(gastronomyId: string, restaurantId: string): Promise<GastronomyEntity> {
      const restaurant: RestaurantEntity = await this.restaurantRepository.findOne({where: {id: restaurantId}});
      if (!restaurant)
        throw new BusinessLogicException("The restaurant with the given id was not found", BusinessError.NOT_FOUND);
     
      const gastronomy: GastronomyEntity = await this.gastronomyRepository.findOne(
          {where: {id: gastronomyId}, relations: ["restaurants"]}
      )
      if (!gastronomy)
        throw new BusinessLogicException("The gastronomy with the given id was not found", BusinessError.NOT_FOUND);
 
      const gastronomyRestaurant: RestaurantEntity = gastronomy.restaurants.find(r => r.id === restaurant.id);
 
      if (!gastronomyRestaurant)
        throw new BusinessLogicException("The restaurant with the given id is not associated to the gastronomy", BusinessError.PRECONDITION_FAILED)
 
      return gastronomy;
  }

}
