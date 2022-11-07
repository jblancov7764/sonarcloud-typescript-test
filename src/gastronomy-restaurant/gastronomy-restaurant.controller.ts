import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { RestaurantEntity } from '../restaurant/restaurant.entity';
import { RestaurantDto } from '../restaurant/restaurant.dto';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { GastronomyRestaurantService } from './gastronomy-restaurant.service';
import { plainToInstance } from 'class-transformer';

@UseInterceptors(BusinessErrorsInterceptor)
@Controller('gastronomies')
export class GastronomyRestaurantController {
    constructor(private readonly gastronomyRestaurantService: GastronomyRestaurantService){}
    
    @Post(':gastronomyId/restaurants/:restaurantId')
    async addRestaurantToGastronomy(@Param('gastronomyId') gastronomyId: string, @Param('restaurantId') restaurantId: string){
        return await this.gastronomyRestaurantService.addRestaurantToGastronomy(gastronomyId, restaurantId);
    }

    @Get(':gastronomyId/restaurants/:restaurantId')
    async findRestaurantByGastronomyIdRestaurantId(@Param('gastronomyId') gastronomyId: string, @Param('restaurantId') restaurantId: string){
        return await this.gastronomyRestaurantService.findRestaurantByGastronomyIdRestaurantId(gastronomyId, restaurantId);
    }

    @Get(':gastronomyId/restaurants')
    async findRestaurantsByGastronomyId(@Param('gastronomyId') gastronomyId: string){
        return await this.gastronomyRestaurantService.findRestaurantsByGastronomyId(gastronomyId);
    }

    @Put(':gastronomyId/restaurants')
    async associateRestaurantsGastronomy(@Body() restaurantDto: RestaurantDto[], @Param('gastronomyId') gastronomyId: string){
        return await this.gastronomyRestaurantService.associateRestaurantsGastronomy(gastronomyId, plainToInstance(RestaurantEntity, restaurantDto));
    }

    @Delete(':gastronomyId/restaurants/:restaurantId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteRestaurantoOfGastronomy(@Param('gastronomyId') gastronomyId: string, @Param('restaurantId') restaurantId: string){
        return await this.gastronomyRestaurantService.deleteRestaurantoOfGastronomy(gastronomyId, restaurantId);
    }

}
