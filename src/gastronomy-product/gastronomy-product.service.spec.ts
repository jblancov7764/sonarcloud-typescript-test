import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmTestingConfig } from "../shared/testing-utils/typeorm-testing-config";
import { GastronomyProductService } from "./gastronomy-product.service";
import { GastronomyService } from "../gastronomy/gastronomy.service";
import { ProductService } from "../products/product.service";
import { Repository } from "typeorm";
import { GastronomyEntity } from "../gastronomy/gastronomy.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { faker } from "@faker-js/faker";
import { ProductEntity } from "../products/product.entity";
import { CACHE_MANAGER } from "@nestjs/common";

const mockCachManager = {
  get : jest.fn(),
  set: jest.fn()
}

describe("GastronomyProductService", () => {
  let service: GastronomyProductService;
  let gastronomyRepository: Repository<GastronomyEntity>;
  let productRepository: Repository<ProductEntity>;
  let gastronomiesList: GastronomyEntity[];
  let productsList: ProductEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [GastronomyProductService, GastronomyService, ProductService,
        {
          provide : CACHE_MANAGER,
          useValue: mockCachManager,
        }
      ]
    }).compile();

    service = module.get<GastronomyProductService>(GastronomyProductService);

    gastronomyRepository = module.get<Repository<GastronomyEntity>>(
      getRepositoryToken(GastronomyEntity)
    );

    productRepository = module.get<Repository<ProductEntity>>(
      getRepositoryToken(ProductEntity)
    );

    await seedDatabase();
  });

  const seedDatabase = async () => {
    gastronomyRepository.clear();
    productRepository.clear();
    gastronomiesList = [];
    productsList = [];

    for (let i = 0; i < 5; i++) {
      const gastronomy: GastronomyEntity = await gastronomyRepository.save({
        name: faker.name.fullName(),
        description: faker.lorem.sentence(),
        country: faker.address.country(),
        products: null
      });
      const product: ProductEntity = await productRepository.save({
        name: faker.name.fullName(),
        description: faker.lorem.sentence(),
        history: faker.address.country(),
        category: faker.word.noun()
      });
      productsList.push(product);
      gastronomiesList.push(gastronomy);
    }
  };

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("add a product should return gastronomy with product associated", async () => {
    let gastronomyEntity = await service.addProduct(
      gastronomiesList[0].id,
      productsList[0].id
    );
    let productEntity = await service.getProduct(gastronomiesList[0].id, productsList[0].id);

    expect(gastronomyEntity.products.length).toBeGreaterThan(0);
  });

  it("add a invalid to valid gastronomy product should return  exception", async () => {
    await expect(() => service.addProduct(
      gastronomiesList[0].id,
      faker.datatype.uuid()
    )).rejects.toHaveProperty("message", "The product with the given id was not found");
  });


  it("add a valid product to invalid gastronomy should return  exception", async () => {
    await expect(() => service.addProduct(
      faker.datatype.uuid(),
      productsList[0].id
    )).rejects.toHaveProperty("message", "The gastronomy with the given id was not found");
  });

  it("get a invalid product to valid gastronomy should return  exception", async () => {
    await expect(() => service.getProduct(
      gastronomiesList[0].id,
      faker.datatype.uuid()
    )).rejects.toHaveProperty("message", "The product with the given id was not found in the gastronomy");
  });

  it("get a invalid product to valid gastronomy should return  exception", async () => {
    let gastronomyEntity = await service.addProduct(
      gastronomiesList[0].id,
      productsList[0].id
    );
    let productEntity = await service.getProduct(gastronomiesList[0].id, productsList[0].id);
    expect(productEntity.id).toEqual(productsList[0].id);
  });

  it("remove a product should return a gastronomy without product", async () => {
    let gastronomyEntity = await service.addProduct(
      gastronomiesList[0].id,
      productsList[0].id
    );
    expect(gastronomyEntity.products.length).toBeGreaterThan(0);
    await service.deleteProduct(gastronomiesList[0].id, productsList[0].id);
    await expect(() => service.getProduct(
      gastronomiesList[0].id,
      productsList[0].id
    )).rejects.toHaveProperty("message", "The product with the given id was not found in the gastronomy");
  });

  it("get aall products should return gastronomy's products", async () => {
    await service.addProduct(
      gastronomiesList[0].id,
      productsList[0].id
    );
    await service.addProduct(
      gastronomiesList[0].id,
      productsList[1].id
    );

    let productEntities = await service.getProducts(gastronomiesList[0].id);

    expect(productEntities.length).toBeGreaterThanOrEqual(2);
  });

  it("update all products should return gastronomy's products updated", async () => {
    await service.addProduct(
      gastronomiesList[0].id,
      productsList[0].id
    );
    await service.addProduct(
      gastronomiesList[0].id,
      productsList[1].id
    );
    await service.updateProducts(gastronomiesList[0].id, [productsList[0].id]);
    const productEntities = await service.getProducts(gastronomiesList[0].id);
    expect(productEntities.length).toBeGreaterThanOrEqual(1);
  });

  it("update all products when product doesn't exist should return error", async () => {
    await service.addProduct(
      gastronomiesList[0].id,
      productsList[0].id
    );
    await expect(() =>
      service.updateProducts(gastronomiesList[0].id, [productsList[0].id, faker.datatype.uuid()])
    ).rejects.toHaveProperty("message", "The product with the given id was not found");
  });
});
