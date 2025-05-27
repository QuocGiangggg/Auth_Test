import { Injectable } from '@nestjs/common';
export type User = {
    userId: number;
    username: string;
    password: string;
}
const users: User[] = [
    {
        userId: 1,
        username: 'john',
        password: 'changeme',
    },
    {
        userId: 2,
        username: 'chris',
        password: '123',
    },
];

@Injectable()
export class UsersService {
    async findUserByName(username: string): Promise<User | undefined> {
        return users.find((user) => user.username === username);
    }
}
