import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { plainToInstance } from 'class-transformer';

import { ProductService } from './product.service';
import { ProductDto } from './product.dto';
import { ProductEntity } from './product.entity';

@Resolver()
export class ProductResolver {
  constructor(private productService: ProductService) {}

  @Query(() => [ProductEntity])
  async products(): Promise<ProductEntity[]> {
    return await this.productService.findAll();
  }

  @Query(() => ProductEntity)
  async product(@Args('id') id: string): Promise<ProductEntity> {
    return await this.productService.findOne(id, true);
  }

  @Mutation(() => ProductEntity)
  async createProduct(@Args('product') productDto: ProductDto): Promise<ProductEntity> {
    const product = plainToInstance(ProductEntity, productDto);
    return await this.productService.create(product);
  }

  @Mutation(() => ProductEntity)
  async updateProduct(@Args('id') id : string, @Args('product') productDto: ProductDto): Promise<ProductEntity> {
    const product = plainToInstance(ProductEntity, productDto);
    return await this.productService.update(id, product);
  }

  @Mutation(() => String)
  async deleteProduct(@Args('id') id: string): Promise<string> {
    await this.productService.delete(id);
    return id;
  }
}
