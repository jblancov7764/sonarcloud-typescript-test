import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import constants from '../shared/security/jwtConstants';
import { User } from '../user/user';

@Injectable()
export class AuthService {

    constructor(
        private usersService: UserService,
        private jwtService: JwtService
    ){}

    async validateUser(username: string, pass: string): Promise<any> {
        const user: User = await this.usersService.findOne(username);
        if (user && user.password === pass) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user:any) {
        const payload = { username: user.username, sub: user.id, roles :  user.roles, permissions: user.permissions};
        return {
            token: this.jwtService.sign(payload, { privateKey: constants.JWT_SECRET }),
        };
    }
}
