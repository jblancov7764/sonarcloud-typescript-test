import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantEntity } from './restaurant.entity';
import { RestaurantService } from './restaurant.service';
import { RestaurantController } from './restaurant.controller';
import { RestaurantResolver } from './restaurant.resolver';

@Module({
imports: [TypeOrmModule.forFeature([RestaurantEntity]), CacheModule.register({
  ttl: 60, 
}
)],
  providers: [RestaurantService, RestaurantResolver],
  controllers: [RestaurantController]
})
export class RestaurantModule {}
