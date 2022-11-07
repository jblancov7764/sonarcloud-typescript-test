/* eslint-disable prettier/prettier */
import { CacheModule, Module } from '@nestjs/common';
import { GastronomyProductService } from './gastronomy-product.service';
import { GastronomyModule } from '../gastronomy/gastronomy.module';
import { ProductModule } from '../products/product.module';
import { GastronomyProductController } from './gastronomy-product.controller';
import { GastronomyProductResolver } from './gastronomy-product.resolver';

@Module({
  imports: [GastronomyModule, ProductModule, CacheModule.register({
    ttl: 60,
  })],
  providers: [GastronomyProductService , GastronomyProductResolver],
  controllers: [GastronomyProductController]
})
export class GastronomyProductModule {}
