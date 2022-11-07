/* eslint-disable prettier/prettier */
import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GastronomyService } from './gastronomy.service';
import { GastronomyEntity } from './gastronomy.entity';
import { GastronomyController } from './gastronomy.controller';
import { GastronomyResolver } from './gastronomy.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([GastronomyEntity]), CacheModule.register({
    ttl: 60, 
  }
  )],
  providers: [GastronomyService, GastronomyResolver],
  exports : [GastronomyService],
  controllers: [GastronomyController],
})
export class GastronomyModule {}
