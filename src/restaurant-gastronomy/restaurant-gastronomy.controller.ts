import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseInterceptors, UseGuards } from '@nestjs/common';
import { GastronomyEntity } from '../gastronomy/gastronomy.entity';
import { GastronomyDto } from '../gastronomy/gastronomy.dto';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { RestaurantGastronomyService } from './restaurant-gastronomy.service';
import { plainToInstance } from 'class-transformer';
import { RequieredPermissions } from '../shared/permissions/decorators/permission.decorator';
import { Permission } from '../shared/permissions/enums/permission.enum';
import { PermissionGuard } from 'src/shared/permissions/guards/permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard, PermissionGuard)
@UseInterceptors(BusinessErrorsInterceptor)
@Controller('restaurants')
export class RestaurantGastronomyController {
    constructor(private readonly restaurantGastronomyService: RestaurantGastronomyService){}
    
    @Post(':restaurantId/gastronomies/:gastronomyId')
    @RequieredPermissions(Permission.CREATE_RESTAURANT_GASTRONOMY)
    async addGastronomyToRestaurant(@Param('restaurantId') restaurantId: string, @Param('gastronomyId') gastronomyId: string){
        return await this.restaurantGastronomyService.addGastronomyToRestaurant(restaurantId, gastronomyId);
    }

    @Get(':restaurantId/gastronomies/:gastronomyId')
    @RequieredPermissions(Permission.READ_RESTAURANT_GASTRONOMY)
    async findGastronomyByRestaurantIdGastronomyId(@Param('restaurantId') restaurantId: string, @Param('gastronomyId') gastronomyId: string){
        return await this.restaurantGastronomyService.findGastronomyByRestaurantIdGastronomyId(restaurantId, gastronomyId);
    }

    @Get(':restaurantId/gastronomies')
    @RequieredPermissions(Permission.READ_RESTAURANT_GASTRONOMIES)
    async findGastronomiesByRestaurantId(@Param('restaurantId') restaurantId: string){
        return await this.restaurantGastronomyService.findGastronomiesByRestaurantId(restaurantId);
    }

    @Put(':restaurantId/gastronomies')
    @RequieredPermissions(Permission.UPDATE_RESTAURANTS_GASTRONOMY)
    async associateGastronomiesRestaurant(@Body() gastronomyDto: GastronomyDto[], @Param('restaurantId') restaurantId: string){
        return await this.restaurantGastronomyService.associateGastronomiesRestaurant(restaurantId, plainToInstance(GastronomyEntity, gastronomyDto));
    }

    @Delete(':restaurantId/gastronomies/:gastronomyId')
    @RequieredPermissions(Permission.DELETE_RESTAURANT_GASTRONOMY)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteGastronomyoOfRestaurant(@Param('restaurantId') restaurantId: string, @Param('gastronomyId') gastronomyId: string){
        return await this.restaurantGastronomyService.deleteGastronomyOfRestaurant(restaurantId, gastronomyId);
    }

}
