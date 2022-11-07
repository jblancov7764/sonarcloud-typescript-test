import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GastronomyEntity } from '../gastronomy/gastronomy.entity';
import { RestaurantEntity } from '../restaurant/restaurant.entity'
import { GastronomyRestaurantService } from './gastronomy-restaurant.service';
import { GastronomyRestaurantController } from './gastronomy-restaurant.controller';
import { GastronomyRestaurantResolver } from './gastronomy-restaurant.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([GastronomyEntity, RestaurantEntity]), CacheModule.register({
    ttl: 60, 
  })],
  providers: [GastronomyRestaurantService, GastronomyRestaurantResolver],
  controllers: [GastronomyRestaurantController]
})
export class GastronomyRestaurantModule {}
