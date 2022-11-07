import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { plainToInstance } from 'class-transformer';
import { RestaurantDto } from 'src/restaurant/restaurant.dto';
import { GastronomyEntity } from '../gastronomy/gastronomy.entity';
import { RestaurantEntity } from '../restaurant/restaurant.entity';

import { GastronomyRestaurantService } from './gastronomy-restaurant.service';

@Resolver()
export class GastronomyRestaurantResolver {
    constructor(private gastronomyRestaurantService: GastronomyRestaurantService) {}

    @Query(() => [RestaurantEntity])
    async restaurantsOfGastronomy(@Args('gastronomyId') gastronomyId: string): Promise<RestaurantEntity[]> {
        return await this.gastronomyRestaurantService.findRestaurantsByGastronomyId(gastronomyId);
    }

    @Query(() => RestaurantEntity)
    async gastronomy(@Args('gastronomyId') gastronomyId: string, @Args('restaurantId') restaurantId: string): Promise<RestaurantEntity> {
        return await this.gastronomyRestaurantService.findRestaurantByGastronomyIdRestaurantId(gastronomyId, restaurantId);
    }

    @Mutation(() => GastronomyEntity)
    async addRestaurantToGastronomy(@Args('gastronomyId') gastronomyId: string, @Args('restaurantId') restaurantId: string): Promise<GastronomyEntity> {
        return await this.gastronomyRestaurantService.addRestaurantToGastronomy(gastronomyId, restaurantId);
    }

    @Mutation(() => GastronomyEntity)
    async updateRestaurantsOfGastronomy(@Args('gastronomyId') gastronomyId: string, @Args({ name: 'restaurants', type: () => [RestaurantDto] }) restaurants: RestaurantDto[]): Promise<GastronomyEntity> {
        return await this.gastronomyRestaurantService.associateRestaurantsGastronomy(gastronomyId, plainToInstance(RestaurantEntity, restaurants));
    }

    @Mutation(() => String)
    async deleteRestaurantoOfGastronomy(@Args('gastronomyId') gastronomyId: string, @Args('restaurantId') restaurantId: string): Promise<string> {
        await this.gastronomyRestaurantService.deleteRestaurantoOfGastronomy(gastronomyId, restaurantId);
        return restaurantId;
    }

}
