import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { plainToInstance } from 'class-transformer';
import { GastronomyDto } from 'src/gastronomy/gastronomy.dto';
import { RestaurantEntity } from '../restaurant/restaurant.entity';
import { GastronomyEntity } from '../gastronomy/gastronomy.entity';

import { RestaurantGastronomyService } from './restaurant-gastronomy.service';

@Resolver()
export class RestaurantGastronomyResolver {
    constructor(private restaurantGastronomyService: RestaurantGastronomyService) {}

    @Query(() => [GastronomyEntity])
    async gastronomiesOfRestaurant(@Args('restaurantId') restaurantId: string): Promise<GastronomyEntity[]> {
        return await this.restaurantGastronomyService.findGastronomiesByRestaurantId(restaurantId);
    }

    @Query(() => GastronomyEntity)
    async restaurant(@Args('restaurantId') restaurantId: string, @Args('gastronomyId') gastronomyId: string): Promise<GastronomyEntity> {
        return await this.restaurantGastronomyService.findGastronomyByRestaurantIdGastronomyId(restaurantId, gastronomyId);
    }

    @Mutation(() => RestaurantEntity)
    async addGastronomyToRestaurant(@Args('restaurantId') restaurantId: string, @Args('gastronomyId') gastronomyId: string): Promise<RestaurantEntity> {
        return await this.restaurantGastronomyService.addGastronomyToRestaurant(restaurantId, gastronomyId);
    }

    @Mutation(() => RestaurantEntity)
    async updateGastronomiesOfRestaurant(@Args('restaurantId') restaurantId: string, @Args({ name: 'gastronomies', type: () => [GastronomyDto] }) gastronomies: GastronomyDto[]): Promise<RestaurantEntity> {
        return await this.restaurantGastronomyService.associateGastronomiesRestaurant(restaurantId, plainToInstance(GastronomyEntity, gastronomies));
    }

    @Mutation(() => String)
    async deleteGastronomyoOfRestaurant(@Args('restaurantId') restaurantId: string, @Args('gastronomyId') gastronomyId: string): Promise<string> {
        await this.restaurantGastronomyService.deleteGastronomyOfRestaurant(restaurantId, gastronomyId);
        return gastronomyId;
    }

}