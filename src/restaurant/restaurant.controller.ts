import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors, UseGuards } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { RestaurantDto } from './restaurant.dto';
import { RestaurantEntity } from './restaurant.entity';
import { RestaurantService } from './restaurant.service';
import { plainToInstance } from 'class-transformer';
import { RequieredPermissions } from '../shared/permissions/decorators/permission.decorator';
import { Permission } from '../shared/permissions/enums/permission.enum';
import { PermissionGuard } from 'src/shared/permissions/guards/permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard, PermissionGuard)
@UseInterceptors(BusinessErrorsInterceptor)
@Controller('restaurants')
export class RestaurantController {

    constructor(private readonly restaurantService: RestaurantService) {}

    @Get()
    @RequieredPermissions(Permission.READ_RESTAURANTS)
    async findAll() {
      return await this.restaurantService.findAll();
    }
  
    @Get(':restaurantId')
    @RequieredPermissions(Permission.READ_RESTAURANT)
    async findOne(@Param('restaurantId') restaurantId: string) {
      return await this.restaurantService.findOne(restaurantId);
    }
  
    @Post()
    @RequieredPermissions(Permission.CREATE_RESTAURANT)
    async create(@Body() restaurantDto: RestaurantDto) {
      const restaurant: RestaurantEntity = plainToInstance(RestaurantEntity, restaurantDto);
      return await this.restaurantService.create(restaurant);
    }
  
    @Put(':restaurantId')
    @RequieredPermissions(Permission.UPDATE_RESTAURANT)
    async update(@Param('restaurantId') restaurantId: string, @Body() restaurantDto: RestaurantDto) {
      const restaurant: RestaurantEntity = plainToInstance(RestaurantEntity, restaurantDto);
      return await this.restaurantService.update(restaurantId, restaurant);
    }
  
    @Delete(':restaurantId')
    @RequieredPermissions(Permission.DELETE_RESTAURANT)
    @HttpCode(204)
    async delete(@Param('restaurantId') restaurantId: string) {
      return await this.restaurantService.delete(restaurantId);
    }
}
