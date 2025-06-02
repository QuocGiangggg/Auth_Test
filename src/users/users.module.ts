import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntitiy } from 'src/auth/entities/user.entities';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { RoleService } from 'src/role/role.service';
import { PermissionService } from 'src/permission/permission.service';
import { Role } from 'src/auth/entities/role.entities';
import { Permission } from 'src/auth/entities/permission.entities';
import { RolePermission } from 'src/auth/entities/role.permission.entities';
import { UserRole } from 'src/auth/entities/user.role.entities';
import { UserPermission } from 'src/auth/entities/user.permission';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/constants/constants';
import { Profile } from 'src/auth/entities/user.profile.entities';
import { CardInfo } from 'src/auth/entities/user.card.info.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntitiy,
      Role,
      Permission,
      RolePermission,
      UserRole,
      UserPermission,
      Profile,
      CardInfo,
    ]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '30d' },
    }),
    RabbitMQModule.forRoot({
      exchanges: [
        {
          name: 'auth',
          type: 'topic',
        },
      ],
      uri: 'amqp://guest:guest@cybercode.ddns.net:5672',
      connectionInitOptions: {
        wait: true,
        reject: false,
      },
    }),
    ElasticsearchModule.register({
      node: 'http://cybercode.ddns.net:9200', // URL Elasticsearch
      auth: {
        username: 'elastic',
        password: 'DuongThanhTung@ElasticSearch@2024',
      },
    }),
  ],
  providers: [UsersService, RoleService, PermissionService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
