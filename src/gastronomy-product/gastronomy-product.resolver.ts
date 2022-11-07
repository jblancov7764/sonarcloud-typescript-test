import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GastronomyProductService } from "./gastronomy-product.service";
import { ProductEntity } from "../products/product.entity";
import { GastronomyEntity } from "../gastronomy/gastronomy.entity";
import { ProductsDto } from "./products.dto";


@Resolver()
export class GastronomyProductResolver {
  constructor(private gastronomyProductService: GastronomyProductService) {
  }

  @Query(() => [ProductEntity])
  async getGastronomyProducts(@Args("gastronomyId") gastronomyId: string): Promise<ProductEntity[]> {
    return await this.gastronomyProductService.getProducts(gastronomyId);
  }

  @Query(() => ProductEntity)
  async getGastronomyProduct(@Args("gastronomyId") gastronomyId: string, @Args("productId") productId: string): Promise<ProductEntity> {
    return await this.gastronomyProductService.getProduct(gastronomyId, productId);
  }

  @Mutation(() => GastronomyEntity)
  async addGastronomyProduct(@Args("gastronomyId") gastronomyId: string, @Args("productId") productId: string): Promise<GastronomyEntity> {
    return await this.gastronomyProductService.addProduct(gastronomyId, productId);
  }

  @Mutation(() => GastronomyEntity)
  async updateGastronomyProduct(@Args("gastronomyId") gastronomyId: string, @Args({name: "products" , type : () => [ProductsDto] }) productsDto: ProductsDto[]): Promise<GastronomyEntity> {
    const productsId = productsDto.map((product) => product.id);
    return await this.gastronomyProductService.updateProducts(gastronomyId, productsId);
  }

  @Mutation(() => String)
  async deleteGastronomyProduct(@Args("gastronomyId") gastronomyId: string, @Args("productId") productId: string): Promise<string> {
    await this.gastronomyProductService.deleteProduct(gastronomyId, productId);
    return productId;
  }
}
