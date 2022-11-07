import { CacheModule, Module } from '@nestjs/common';
import { RestaurantGastronomyService } from './restaurant-gastronomy.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantEntity } from '../restaurant/restaurant.entity';
import { GastronomyEntity } from '../gastronomy/gastronomy.entity';
import { RestaurantGastronomyController } from './restaurant-gastronomy.controller';
import { RestaurantGastronomyResolver } from './restaurant-gastronomy.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([RestaurantEntity, GastronomyEntity]), CacheModule.register({
    ttl: 60, 
  }
  )],
  providers: [RestaurantGastronomyService, RestaurantGastronomyResolver],
  controllers: [RestaurantGastronomyController]
})
export class RestaurantGastronomyModule {}
