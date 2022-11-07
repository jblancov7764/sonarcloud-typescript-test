import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GastronomyEntity } from '../gastronomy/gastronomy.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class ProductEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  description: string;

  @Field()
  @Column()
  history: string;

  @Field()
  @Column()
  category: string;

  @Field(type => GastronomyEntity)
  @ManyToOne(() => GastronomyEntity, (gastronomy) => gastronomy.products)
  gastronomy: GastronomyEntity;
}
