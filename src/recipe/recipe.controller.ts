/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors, UseGuards } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { RecipeService } from './recipe.service';
import { RecipeEntity } from './recipe.entity';
import { RecipeDto } from './recipe.dto';
import { RequieredPermissions } from '../shared/permissions/decorators/permission.decorator';
import { Permission } from '../shared/permissions/enums/permission.enum';
import { PermissionGuard } from 'src/shared/permissions/guards/permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('recipes')

@UseInterceptors(BusinessErrorsInterceptor)
export class RecipeController {
    constructor(private readonly recipeService: RecipeService) {}

    @Get()
    @RequieredPermissions(Permission.READ_RECIPES)

    async findAll() {
        return await this.recipeService.findAll();
    }

    @Get(':recipeId')
    @RequieredPermissions(Permission.READ_RECIPE)
    async findOne(@Param('recipeId') recipeId: string) {
        return await this.recipeService.findOne(recipeId);
    }

    @Post()
    @RequieredPermissions(Permission.CREATE_RECIPE)
    async create(@Body() recipeDto: RecipeDto) {
        const recipe: RecipeEntity = plainToInstance(RecipeEntity, recipeDto);
        return await this.recipeService.create(recipe);
    }

    @Put(':recipeId')
    @RequieredPermissions(Permission.UPDATE_RECIPE)
    async update(@Param('recipeId') recipeId: string, @Body() recipeDto: RecipeDto) {
        const recipe: RecipeEntity = plainToInstance(RecipeEntity, recipeDto);
        return await this.recipeService.update(recipeId, recipe);
    }

    @Delete(':recipeId')
    @HttpCode(204)
    @RequieredPermissions(Permission.DELETE_RECIPE)
    async delete(@Param('recipeId') recipeId: string) {
        return await this.recipeService.delete(recipeId);
    }
}

/* archivo: src/recipe/recipe.controller.ts */
