/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { User } from './user';

@Injectable()
export class UserService {
   private users: User[] = [
       new User(1, "admin", "admin", ["admin"], ["all"]),
       new User(2, "user", "admin", ["user"], ["read:gastronomies"]),
       new User(3, "restaurantsReaderUser", "admin", ["user"], ["read:restaurants", "read:restaurant", "read:restaurant-gastronomies", "read:restaurant-gastronomy"]),
       new User(4, "creatorUpdaterUser", "admin", ["user"], ["create:gastronomy", "update:gastronomy", "create:gastronomy-restaurant", "update:gastronomies-restaurant", "create:restaurant", "update:restaurant", "create:restaurant-gastronomy", "update:restaurants-gastronomy", "create:recipe", "update:recipe"]),
       new User(5, "deleterUser", "admin", ["user"], ["delete:gastronomy", "delete:gastronomy-restaurant", "delete:restaurant", "delete:restaurant-gastronomy", "delete:recipe"]),
       new User(6, "productReaderUser", "admin", ["user"], ["read:product", "read:products", "create:product", "update:product", "delete:product"]),
       new User(7, "productUpdaterUser", "admin", ["user"], ["create:product", "update:product", "delete:product"]),
       new User(8, "productDeleterUser", "admin", ["user"], ["delete:product"]),
       new User(9, "productGastronomyUser", "admin", ["user"], ["read:product", "read:products", "create:product", "update:product", "delete:product","update:gastronomy","read:gastronomy" , "read:gastronomy"]),
       new User(10, "recipeReaderUser", "admin", ["user"], ["read:recipes", "read:recipe"]) 
    ];

   async findOne(username: string): Promise<User | undefined> {
       return this.users.find(user => user.username === username);
   }
}
