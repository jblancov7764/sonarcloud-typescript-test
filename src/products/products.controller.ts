/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseGuards, UseInterceptors } from "@nestjs/common";
import { BusinessErrorsInterceptor } from "../shared/interceptors/business-errors.interceptor";
import { ProductEntity } from "./product.entity";
import { plainToInstance } from "class-transformer";
import { ProductService } from "./product.service";
import { ProductDto } from "./product.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionGuard } from "../shared/permissions/guards/permission.guard";
import { RequieredPermissions } from "../shared/permissions/decorators/permission.decorator";
import { Permission } from "../shared/permissions/enums/permission.enum";

@UseGuards(JwtAuthGuard, PermissionGuard)
@UseInterceptors(BusinessErrorsInterceptor)
@Controller('products')
export class ProductController {

    constructor(private readonly productService: ProductService) {}

    @Get()
    @RequieredPermissions(Permission.READ_PRODUCTS)
    async findAll() {
      return await this.productService.findAll();
    }

    @Get(':productID/gastronomies')
    @RequieredPermissions(Permission.READ_PRODUCT)
    async findOneWithGastronomy(@Param('productID') productID: string) {
      return this.productService.findOne(productID,true).then(product =>  product.gastronomy);
    }

    @Get(':productID')
    @RequieredPermissions(Permission.READ_PRODUCT)
    async findOne(@Param('productID') productID: string) {
      return await this.productService.findOne(productID);
    }

    @Post()
    @RequieredPermissions(Permission.CREATE_PRODUCT)
    async create(@Body() productDto: ProductDto) {
      const restaurant: ProductEntity = plainToInstance(ProductEntity, productDto);
      return await this.productService.create(restaurant);
    }

    @Put(':productID')
    @RequieredPermissions(Permission.UPDATE_PRODUCT)
    async update(@Param('productID') productID: string, @Body() productDto: ProductDto) {
      const restaurant: ProductEntity = plainToInstance(ProductEntity, productDto);
      return await this.productService.update(productID, restaurant);
    }

    @Delete(':productID')
    @HttpCode(204)
    @RequieredPermissions(Permission.DELETE_PRODUCT)
    async delete(@Param('productID') productID: string) {
      return await this.productService.delete(productID);
    }
}

