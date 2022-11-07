import { GastronomyEntity } from "../gastronomy/gastronomy.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class RestaurantEntity {
    @Field()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Field()
    @Column()
    name: string;

    @Field()
    @Column()
    city: string;

    @Field()
    @Column()
    country: string;

    @Field()
    @Column()
    michellinStars: number;

    @Field()
    @Column()
    lastMichellinStarDate: Date;

    @Field(type => [GastronomyEntity])
    @ManyToMany(() => GastronomyEntity, gastronomy => gastronomy.restaurants)
    @JoinTable()
    gastronomies: GastronomyEntity[];
}
