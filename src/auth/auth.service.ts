import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt'; // Assuming JwtService is used for token generation
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { SignInDTO} from './dto/signin.dto';
import * as bcrypt from 'bcrypt'; // Assuming bcrypt is used for password hashing
import { Partner } from './dto/partner'; // Adjust the import path as necessary
import { Employee } from './dto/employee'; // Add this import, adjust the path if needed


@Injectable()
export class AuthService {
    constructor(
        @Inject()
        private usersService: UsersService,
        private jwtService: JwtService, // Assuming JwtService is used for token generation
        private readonly amqpConnection: AmqpConnection, // Assuming AmqpConnection is used for RabbitMQ messaging
    ) {}

    async validateUser(username: string, password: string): Promise<any> {
        const  user = await this.usersService.findOne(username);
        const isMatch = await bcrypt.compare(password, user.password);
        if( user && isMatch) {
            return user; // Return the user object if validation is successful
        }
        return null; // Return null if validation fails
    }
    async login(usersLogin: SignInDTO){
        const user = await this.usersService.findOne(usersLogin.username, [
            'userRoles',
            'userRoles.role',
            'userRoles.role.parent',
        ]);
        if(!user){
            throw new HttpException(
                `Không tồn tại người dùng ${usersLogin.username}`, 
                HttpStatus.FORBIDDEN,);
        }
        const isMatch = await bcrypt.compare(usersLogin.password, user.password);
        if(!isMatch){
            throw new HttpException(
                'Mật khẩu không đúng', 
                HttpStatus.FORBIDDEN,
            );
        }
        const rolePartner = user.userRoles.filter((item) => item.role.id == 3);
    if (rolePartner.length > 0) {
        const partner = await this.amqpConnection.request<Partner>({
                exchange: 'partner',
                routingKey: 'get_partner',
                timeout: 1000,
                payload: {
                    userId: user.id,
            },
        });
        const payload = {
            userName: user.userName,
            sub: user.id,
            partnerId: partner.partnerId,
            role: user.userRoles.map((item) => item.role.id).join(','),
            uuid: user.uuid,
        };
        return {
            access_token: this.jwtService.sign(payload),
        };
    } else {
        let employee: Employee | null = null;
        try {
         employee = await this.amqpConnection.request<Employee>({
            exchange: 'employee',
            routingKey: 'get_employee',
            payload: {
                userId: user.id,
                 },
            });
        } catch (error) {}
        const payload = {
            userName: user.userName,
            sub: user.id,
            employeeCode: employee?.employeeCode ?? null,
            company: employee?.companyId ?? null,
            position: employee?.positionId ?? null,
            role: user.userRoles
                ? user.userRoles.map((item) => item.role.id).join(',')
                : null,
            uuid: user.uuid,
            };
        if (usersLogin.remember)
        return {
            access_token: this.jwtService.sign(payload, { expiresIn: '365d' }),
        };
        else
        return {
            access_token: this.jwtService.sign(payload, { expiresIn: '1d' }),
        };
      }
    }
}