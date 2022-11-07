/* eslint-disable prettier/prettier */
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { ProductEntity } from './product.entity';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';
import { Cache } from 'cache-manager';

@Injectable()
export class ProductService {
  cacheKeyProducts = "products";

  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsEntityRepository: Repository<ProductEntity>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache
  ) {
  }

  async findAll(): Promise<ProductEntity[]> {
    const cachedProducts: ProductEntity[] = await this.cacheManager.get<ProductEntity[]>(this.cacheKeyProducts);
    if (!cachedProducts) {
      const productEntities = await this.productsEntityRepository.find({});
      await this.cacheManager.set<ProductEntity[]>(this.cacheKeyProducts, productEntities);
      return productEntities;
    }
    return cachedProducts;
  }

  async findOne(id: string, withGastronomy = false): Promise<ProductEntity> {
    let options: FindOneOptions = { where: { id } };
    options = withGastronomy ? { ...options, ...{ relations : ['gastronomy'] } } : options;
    const product: ProductEntity = await this.productsEntityRepository.findOne(options);
    if (!product)
      throw new BusinessLogicException(
        'The product with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    return product;
  }

  async create(productEntity: ProductEntity): Promise<ProductEntity> {
    return await this.productsEntityRepository.save(productEntity);
  }

  async update(
    id: string,
    productEntity: ProductEntity,
  ): Promise<ProductEntity> {
    const oldProduct: ProductEntity =
      await this.productsEntityRepository.findOne({ where: { id } });
    if (!oldProduct)
      throw new BusinessLogicException(
        'The product with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    Object.assign(oldProduct, productEntity);

    return await this.productsEntityRepository.save(oldProduct);
  }

  async delete(id: string) {
    const productsEntity: ProductEntity =
      await this.productsEntityRepository.findOne({ where: { id } });
    if (!productsEntity)
      throw new BusinessLogicException(
        'The product with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    await this.productsEntityRepository.remove(productsEntity);
  }
}
