export class User {
    constructor(public id: number, 
                public username: string, 
                public password: string, 
                public roles: string[],
                public permissions: string[]) {
    }
}
