import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';

import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { GastronomyEntity } from './gastronomy.entity';

@Injectable()
export class GastronomyService {

    cacheKeyGastronomies: string = "gastronomies";

    constructor(
        @InjectRepository(GastronomyEntity)
        private readonly gastronomyRepository: Repository<GastronomyEntity>,

        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache
    ){}

    async findAll(): Promise<GastronomyEntity[]> {
        const cached: GastronomyEntity[] = await this.cacheManager.get<GastronomyEntity[]>(this.cacheKeyGastronomies);
        if(!cached){
            const gastronomies : GastronomyEntity[] = await this.gastronomyRepository.find({relations: ['restaurants', 'products', 'recipes']});
            await this.cacheManager.set<GastronomyEntity[]>(this.cacheKeyGastronomies, gastronomies);
            return gastronomies;
        }
        return cached;
    }

    async findOne(id: string): Promise<GastronomyEntity> {
        const gastronomy: GastronomyEntity = await this.gastronomyRepository.findOne({where: {id}, relations: ['restaurants', 'products', 'recipes']});
        if (!gastronomy)
          throw new BusinessLogicException("The gastronomy with the given id was not found", BusinessError.NOT_FOUND);
   
        return gastronomy;
    }

    async create(gastronomy: GastronomyEntity): Promise<GastronomyEntity> {
        return await this.gastronomyRepository.save(gastronomy);
    }

    async update(id: string, gastronomy: GastronomyEntity): Promise<GastronomyEntity> {
        const persistedGastronomy: GastronomyEntity = await this.gastronomyRepository.findOne({where:{id}});
        if (!persistedGastronomy)
          throw new BusinessLogicException("The gastronomy with the given id was not found", BusinessError.NOT_FOUND);
       
        Object.assign(persistedGastronomy, gastronomy);
       
        return await this.gastronomyRepository.save(persistedGastronomy);
    }

    async delete(id: string) {
        const gastronomy: GastronomyEntity = await this.gastronomyRepository.findOne({where:{id}});
        if (!gastronomy)
          throw new BusinessLogicException("The gastronomy with the given id was not found", BusinessError.NOT_FOUND);
     
        await this.gastronomyRepository.remove(gastronomy);
    }

}
