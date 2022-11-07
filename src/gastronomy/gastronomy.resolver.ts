import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { plainToInstance } from 'class-transformer';

import { GastronomyDto } from './gastronomy.dto';
import { GastronomyEntity } from './gastronomy.entity';
import { GastronomyService } from './gastronomy.service';

@Resolver()
export class GastronomyResolver {
    constructor(private gastronomyService: GastronomyService) {}

    @Query(() => [GastronomyEntity])
    async gastronomies(): Promise<GastronomyEntity[]> {
        return await this.gastronomyService.findAll();
    }

    @Query(() => GastronomyEntity)
    async gastronomy(@Args('id') id: string): Promise<GastronomyEntity> {
        return await this.gastronomyService.findOne(id);
    }

    @Mutation(() => GastronomyEntity)
    async createGastronomy(@Args('gastronmy') gastronomyDto: GastronomyDto): Promise<GastronomyEntity> {
        const gastronomy = plainToInstance(GastronomyEntity, gastronomyDto);
        return await this.gastronomyService.create(gastronomy);
    }

    @Mutation(() => GastronomyEntity)
    async updateGastronomy(@Args('id') id : string, @Args('gastronmy') gastronomyDto: GastronomyDto): Promise<GastronomyEntity> {
        const gastronomy = plainToInstance(GastronomyEntity, gastronomyDto);
        return await this.gastronomyService.update(id, gastronomy);
    }

    @Mutation(() => String)
    async deleteGastronomy(@Args('id') id : string): Promise<string> {
        await this.gastronomyService.delete(id);
        return id;
    }

}
