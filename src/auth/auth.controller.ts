import { 
    Controller, 
    HttpCode, 
    HttpStatus,
    Post,
    Body,
    } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) { 
        // Constructor can be used for dependency injection if needed
    }


    @HttpCode(HttpStatus.OK)
    @Post('login')
    login(@Body() input: { username: string; password: string }) {
        return this.authService.authenticate(input);
      }
}