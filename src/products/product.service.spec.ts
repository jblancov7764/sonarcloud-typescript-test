import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';

import { faker } from '@faker-js/faker';
import { ProductService } from './product.service';
import { ProductEntity } from './product.entity';
import { GastronomyEntity } from '../gastronomy/gastronomy.entity';
import { CACHE_MANAGER } from '@nestjs/common';

const mockCachManager = {
  get : jest.fn(),
  set: jest.fn()
}

describe('ProductService', () => {
  let service: ProductService;
  let repository: Repository<ProductEntity>;
  let gastronomyRepository: Repository<GastronomyEntity>;
  let productsEntities: ProductEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ProductService , {
        provide : CACHE_MANAGER,
        useValue: mockCachManager,
      }],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repository = module.get<Repository<ProductEntity>>(
      getRepositoryToken(ProductEntity),
    );
    gastronomyRepository = module.get<Repository<GastronomyEntity>>(
      getRepositoryToken(GastronomyEntity),
    );
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    gastronomyRepository.clear();
    productsEntities = [];
    const gastronomy: GastronomyEntity = await gastronomyRepository.save({
      name: faker.name.fullName(),
      description: faker.lorem.sentence(),
      country: faker.address.country(),
    });
    for (let i = 0; i < 5; i++) {
      const productEntity: ProductEntity = await repository.save({
        name: faker.name.fullName(),
        description: faker.lorem.sentence(),
        history: faker.lorem.sentence(),
        category: faker.lorem.sentence(),
        gastronomy: gastronomy
      });
      productsEntities.push(productEntity);
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all products', async () => {
    const products: ProductEntity[] = await service.findAll();
    expect(products).not.toBeNull();
    expect(products).toHaveLength(productsEntities.length);
  });

  it('findOne should return a product by id', async () => {
    const oldProduct: ProductEntity = productsEntities[0];
    const product: ProductEntity = await service.findOne(oldProduct.id);
    expect(product).not.toBeNull();
    expect(product.name).toEqual(oldProduct.name);
    expect(product.description).toEqual(oldProduct.description);
    expect(product.history).toEqual(oldProduct.history);
    expect(product.category).toEqual(oldProduct.category);
    expect(product.gastronomy).toBeUndefined()
  });

  it('findOne should return a product by id with Gastronomy', async () => {
    const oldProduct: ProductEntity = productsEntities[0];
    const product: ProductEntity = await service.findOne(oldProduct.id, true);
    expect(product).not.toBeNull();
    expect(product.name).toEqual(oldProduct.name);
    expect(product.description).toEqual(oldProduct.description);
    expect(product.history).toEqual(oldProduct.history);
    expect(product.category).toEqual(oldProduct.category);
    expect(product.gastronomy).not.toBeNull();
  });

  it('findOne should throw an exception for an invalid product', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'The product with the given id was not found',
    );
  });

  it('create should return a new product', async () => {
    const product: ProductEntity = {
      id: '',
      name: faker.name.fullName(),
      description: faker.lorem.sentence(),
      history: faker.address.country(),
      category: faker.lorem.word(),
      gastronomy: null
    };

    const newProduct: ProductEntity = await service.create(product);
    expect(newProduct).not.toBeNull();

    const storedProduct: ProductEntity = await repository.findOne({
      where: { id: newProduct.id },
    });
    expect(storedProduct).not.toBeNull();
    expect(storedProduct.name).toEqual(newProduct.name);
    expect(storedProduct.description).toEqual(newProduct.description);
    expect(storedProduct.description).toEqual(newProduct.description);
    expect(storedProduct.category).toEqual(newProduct.category);
  });

  it('update should modify a product', async () => {
    const product: ProductEntity = productsEntities[0];
    product.name = 'New name';
    product.description = 'New description';
    product.history = 'New history';
    product.category = 'New category';

    const updatedProduct: ProductEntity = await service.update(
      product.id,
      product,
    );
    expect(updatedProduct).not.toBeNull();

    const storedProduct: ProductEntity = await repository.findOne({
      where: { id: product.id },
    });
    expect(storedProduct).not.toBeNull();
    expect(storedProduct.name).toEqual(product.name);
    expect(storedProduct.description).toEqual(product.description);
    expect(storedProduct.history).toEqual(product.history);
    expect(storedProduct.category).toEqual(product.category);
  });

  it('update should throw an exception for an invalid product', async () => {
    const product: ProductEntity = productsEntities[0];
    product.name = 'New name';
    product.description = 'New description';
    product.history = 'New history';
    product.category = 'New category';

    await expect(() => service.update('0', product)).rejects.toHaveProperty(
      'message',
      'The product with the given id was not found',
    );
  });

  it('delete should remove a product', async () => {
    const product: ProductEntity = productsEntities[0];
    await service.delete(product.id);

    const deletedProduct: ProductEntity = await repository.findOne({
      where: { id: product.id },
    });
    expect(deletedProduct).toBeNull();
  });

  it('delete should throw an exception for an invalid product', async () => {
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'The product with the given id was not found',
    );
  });
});
