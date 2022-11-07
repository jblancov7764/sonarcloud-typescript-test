import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { plainToInstance } from 'class-transformer';

import { RestaurantDto } from './restaurant.dto';
import { RestaurantEntity } from './restaurant.entity';
import { RestaurantService } from './restaurant.service';

@Resolver()
export class RestaurantResolver {
    constructor(private restaurantService: RestaurantService) {}

    @Query(() => [RestaurantEntity])
    async restaurants(): Promise<RestaurantEntity[]> {
        return await this.restaurantService.findAll();
    }

    @Query(() => RestaurantEntity)
    async restaurant(@Args('id') id: string): Promise<RestaurantEntity> {
        return await this.restaurantService.findOne(id);
    }

    @Mutation(() => RestaurantEntity)
    async createRestaurant(@Args('restaurant') restaurantDto: RestaurantDto): Promise<RestaurantEntity> {
        const restaurant = plainToInstance(RestaurantEntity, restaurantDto);
        return await this.restaurantService.create(restaurant);
    }

    @Mutation(() => RestaurantEntity)
    async updateRestaurant(@Args('id') id : string, @Args('restaurant') restaurantDto: RestaurantDto): Promise<RestaurantEntity> {
        const restaurant = plainToInstance(RestaurantEntity, restaurantDto);
        return await this.restaurantService.update(id, restaurant);
    }

    @Mutation(() => String)
    async deleteRestaurant(@Args('id') id : string): Promise<string> {
        await this.restaurantService.delete(id);
        return id;
    }

}