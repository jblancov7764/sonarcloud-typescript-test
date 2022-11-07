import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RestaurantEntity } from '../restaurant/restaurant.entity';
import { GastronomyEntity } from '../gastronomy/gastronomy.entity';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { Repository } from 'typeorm';

import { Cache } from 'cache-manager';

@Injectable()
export class RestaurantGastronomyService {

    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepository: Repository<RestaurantEntity>
    @InjectRepository(GastronomyEntity)
    private readonly gastronomyRepository: Repository<GastronomyEntity>

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache

    async addGastronomyToRestaurant(restaurantId: string, gastronomyId: string): Promise<RestaurantEntity> {
        const gastronomy: GastronomyEntity = await this.gastronomyRepository.findOne({where: {id: gastronomyId}});
        if (!gastronomy)
          throw new BusinessLogicException("The gastronomy with the given id was not found", BusinessError.NOT_FOUND);
      
        const restaurant: RestaurantEntity = await this.restaurantRepository.findOne(
            {where: {id: restaurantId}, relations: ["gastronomies"]}
            )
        if (!restaurant)
          throw new BusinessLogicException("The restaurant with the given id was not found", BusinessError.NOT_FOUND);

        restaurant.gastronomies = [...restaurant.gastronomies, gastronomy];
        return await this.restaurantRepository.save(restaurant);
    }

    async findGastronomyByRestaurantIdGastronomyId(restaurantId: string, gastronomyId: string): Promise<GastronomyEntity> {

        const restaurant: RestaurantEntity = await this.validate(restaurantId, gastronomyId);
   
        return restaurant.gastronomies.find(r => r.id === gastronomyId);
    }

    async findGastronomiesByRestaurantId(restaurantId: string): Promise<GastronomyEntity[]> {
      const cached: RestaurantEntity = await this.cacheManager.get<RestaurantEntity>(restaurantId);
      if(!cached){
        const restaurant: RestaurantEntity = await this.restaurantRepository.findOne(
          {where: {id: restaurantId}, relations: ["gastronomies"]}
          )
        if (!restaurant)
          throw new BusinessLogicException("The restaurant with the given id was not found", BusinessError.NOT_FOUND);
        await this.cacheManager.set<RestaurantEntity>(restaurantId, restaurant);
        return restaurant.gastronomies;
    }
      return cached.gastronomies;
  }
    
    async associateGastronomiesRestaurant(restaurantId: string, gastronomies: GastronomyEntity[]): Promise<RestaurantEntity> {
        const restaurant: RestaurantEntity = await this.restaurantRepository.findOne({where: {id: restaurantId}, relations: ["gastronomies"]});
    
        if (!restaurant)
          throw new BusinessLogicException("The restaurant with the given id was not found", BusinessError.NOT_FOUND)
    
        for (let i = 0; i < gastronomies.length; i++) {
          const gastronomy: GastronomyEntity = await this.gastronomyRepository.findOne({where: {id: gastronomies[i].id}});
          if (!gastronomy)
            throw new BusinessLogicException("The gastronomy with the given id was not found", BusinessError.NOT_FOUND)
        }
    
        restaurant.gastronomies = gastronomies;
        return await this.restaurantRepository.save(restaurant);
    }

    async deleteGastronomyOfRestaurant(restaurantId: string, gastronomyId: string){

        const restaurant: RestaurantEntity = await this.validate(restaurantId, gastronomyId);
   
        restaurant.gastronomies = restaurant.gastronomies.filter(r => r.id !== gastronomyId);

        await this.restaurantRepository.save(restaurant);
    }

    private async validate(restaurantId: string, gastronomyId: string): Promise<RestaurantEntity> {
        const gastronomy: GastronomyEntity = await this.gastronomyRepository.findOne({where: {id: gastronomyId}});
        if (!gastronomy)
          throw new BusinessLogicException("The gastronomy with the given id was not found", BusinessError.NOT_FOUND);
      
        const restaurant: RestaurantEntity = await this.restaurantRepository.findOne(
            {where: {id: restaurantId}, relations: ["gastronomies"]}
            )
        if (!restaurant)
          throw new BusinessLogicException("The restaurant with the given id was not found", BusinessError.NOT_FOUND);
 
      const restaurantGastronomy: GastronomyEntity = restaurant.gastronomies.find(r => r.id === gastronomy.id);
 
      if (!restaurantGastronomy)
        throw new BusinessLogicException("The gastronomy with the given id is not associated to the restaurant", BusinessError.PRECONDITION_FAILED)
 
      return restaurant;
  }
}
