/* eslint-disable prettier/prettier */
import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { GastronomyService } from "../gastronomy/gastronomy.service";
import { ProductService } from "../products/product.service";
import { GastronomyEntity } from "../gastronomy/gastronomy.entity";
import { ProductEntity } from "../products/product.entity";
import {
  BusinessError,
  BusinessLogicException
} from "../shared/errors/business-errors";
import { Cache } from "cache-manager";

@Injectable()
export class GastronomyProductService {
  cacheKeyGastronomyProduct = "gastronomy-products";
  constructor(
    private readonly gastronomyService: GastronomyService,
    private readonly productService: ProductService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache
  ) {
  }

  async addProduct(gastronomyId: string, productId: string): Promise<GastronomyEntity> {
    const gastronomy: GastronomyEntity = await this.gastronomyService.findOne(gastronomyId);
    const product: ProductEntity = await this.productService.findOne(productId);

    gastronomy.products = gastronomy.products
      ? [...gastronomy.products, product]
      : [product];

    return await this.gastronomyService.update(gastronomy.id, gastronomy);
  }

  async getProduct(gastronomyId: string, productId: string): Promise<ProductEntity> {
    const gastronomy: GastronomyEntity = await this.gastronomyService.findOne(gastronomyId);
    const productEntity = gastronomy.products.find((product) => (product.id == productId));
    if (!productEntity)
      throw new BusinessLogicException("The product with the given id was not found in the gastronomy", BusinessError.NOT_FOUND);
    return productEntity;
  }

  async getProducts(gastronomyId: string): Promise<ProductEntity[]> {
    const cachedProducts: ProductEntity[] = await this.cacheManager.get<ProductEntity[]>(this.cacheKeyGastronomyProduct);
    if (!cachedProducts) {
      const gastronomyEntity = await this.gastronomyService.findOne(gastronomyId);
      const productEntities = gastronomyEntity.products;
      await this.cacheManager.set<ProductEntity[]>(this.cacheKeyGastronomyProduct, productEntities);
      return productEntities;
    }
    return cachedProducts;
  }

  async deleteProduct(gastronomyId: string, productId: string) {
    const gastronomy: GastronomyEntity = await this.gastronomyService.findOne(gastronomyId);
    await this.productService.findOne(productId);
    gastronomy.products = gastronomy.products.filter(product => {
      return product.id != productId;
    });
    await this.gastronomyService.update(gastronomyId, gastronomy);
  }

  async updateProducts(gastronomyId: string, productsId: string[]): Promise<GastronomyEntity> {
    const gastronomy: GastronomyEntity = await this.gastronomyService.findOne(gastronomyId);
    gastronomy.products = gastronomy.products.filter(product => {
      return productsId.includes(product.id);
    });

    for (const id of productsId) {
      await this.productService.findOne(id);
    }
    return await this.gastronomyService.update(gastronomyId, gastronomy);
  }
}
