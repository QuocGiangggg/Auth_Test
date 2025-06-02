import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { jwtConstants } from '../constants/constants'; // Adjust the path if your constants file is elsewhere
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    JwtModule.register({
      secret: jwtConstants.secret, // Use the secret from your constants file 
      signOptions: { expiresIn: '1d' }, // Token expiration time],
    }),
    RabbitMQModule.forRoot({
      exchanges:[
        {
          name: 'auth_exchange',
          type: 'topic',
        },
      ],
      uri: 'http://localhost',
     }), // Adjust the RabbitMQ URI as needed
    ElasticsearchModule.register({
      node: 'http://localhost:9200', // Adjust the Elasticsearch node as needed
    }),
    ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
