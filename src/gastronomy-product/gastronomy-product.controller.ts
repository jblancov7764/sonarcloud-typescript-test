/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { BusinessErrorsInterceptor } from "../shared/interceptors/business-errors.interceptor";
import { GastronomyProductService } from "./gastronomy-product.service";
import { ProductsDto } from "./products.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionGuard } from "../shared/permissions/guards/permission.guard";
import { RequieredPermissions } from "../shared/permissions/decorators/permission.decorator";
import { Permission } from "../shared/permissions/enums/permission.enum";

@UseGuards(JwtAuthGuard, PermissionGuard)
@UseInterceptors(BusinessErrorsInterceptor)
@Controller('gastronomies')
export class GastronomyProductController {
    constructor(private readonly gastronomyProductService: GastronomyProductService){}

    @Post(':gastronomyId/products/:productId')
    @RequieredPermissions(Permission.UPDATE_GASTRONOMY, Permission.UPDATE_PRODUCT)
    async addProduct(@Param('gastronomyId') gastronomyId: string, @Param('productId') productId: string){
        return await this.gastronomyProductService.addProduct(gastronomyId, productId);
    }

    @Get(':gastronomyId/products/:productId')
    @RequieredPermissions(Permission.READ_GASTRONOMY , Permission.READ_PRODUCT)
    async getProduct(@Param('gastronomyId') gastronomyId: string, @Param('productId') productId: string){
        return await this.gastronomyProductService.getProduct(gastronomyId, productId);
    }

    @Get(':gastronomyId/products')
    @RequieredPermissions(Permission.READ_PRODUCTS , Permission.READ_GASTRONOMY)
    async getProducts(@Param('gastronomyId') gastronomyId: string){
        return await this.gastronomyProductService.getProducts(gastronomyId);
    }

    @Delete(':gastronomyId/products/:productId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @RequieredPermissions(Permission.UPDATE_GASTRONOMY, Permission.DELETE_PRODUCT)
    async deleteProduct(@Param('gastronomyId') gastronomyId: string, @Param('productId') productId: string){
        return await this.gastronomyProductService.deleteProduct(gastronomyId, productId);
    }

    @Put(':gastronomyId/products')
    @RequieredPermissions(Permission.UPDATE_GASTRONOMY, Permission.DELETE_PRODUCT , Permission.UPDATE_PRODUCT)
    async updateProducts(@Param('gastronomyId') gastronomyId: string, @Body() productsDto: ProductsDto[]){
        const productsId = productsDto.map(product => product.id);
        return await this.gastronomyProductService.updateProducts(gastronomyId, productsId);
    }

}
