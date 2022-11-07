/* eslint-disable prettier/prettier */
import { CacheModule, Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './product.entity';
import { ProductService } from './product.service';
import { ProductController } from './products.controller';
import { ProductResolver } from './product.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity]), CacheModule.register({
    ttl: 60,
  })],
  providers: [ProductService , ProductResolver],
  exports : [ProductService],
  controllers: [ProductController]
})
export class ProductModule {}
