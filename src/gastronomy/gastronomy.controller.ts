import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { RequieredPermissions } from '../shared/permissions/decorators/permission.decorator';
import { Permission } from '../shared/permissions/enums/permission.enum';
import { PermissionGuard } from 'src/shared/permissions/guards/permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { GastronomyDto } from './gastronomy.dto';
import { GastronomyEntity } from './gastronomy.entity';
import { GastronomyService } from './gastronomy.service';

@UseGuards(JwtAuthGuard, PermissionGuard)
@UseInterceptors(BusinessErrorsInterceptor)
@Controller('gastronomies')
export class GastronomyController {

    constructor(private readonly gastronomyService: GastronomyService) {}

    @Get()
    @RequieredPermissions(Permission.READ_GASTRONOMIES)
    async findAll() {
      return await this.gastronomyService.findAll();
    }

    @Get(':gastronomyId')
    @RequieredPermissions(Permission.READ_GASTRONOMY)
    async findOne(@Param('gastronomyId') gastronomyId: string) {
      return await this.gastronomyService.findOne(gastronomyId);
    }

    @Post()
    @RequieredPermissions(Permission.CREATE_GASTRONOMY)
    async create(@Body() gastronomyDto: GastronomyDto) {
      return await this.gastronomyService.create(plainToInstance(GastronomyEntity, gastronomyDto));
    }

    @Put(':gastronomyId')
    @RequieredPermissions(Permission.UPDATE_GASTRONOMY)
    async update(@Param('gastronomyId') gastronomyId: string, @Body() gastronomyDto: GastronomyDto) {
      return await this.gastronomyService.update(gastronomyId, plainToInstance(GastronomyEntity, gastronomyDto));
    }

    @Delete(':gastronomyId')
    @RequieredPermissions(Permission.DELETE_GASTRONOMY)
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('gastronomyId') gastronomyId: string) {
      return await this.gastronomyService.delete(gastronomyId);
    }
}


