import { 
    Controller, 
    HttpCode, 
    HttpStatus,
    Post,
    Body,
    Request,
    Get,
    UseGuards,
    } from '@nestjs/common';
import { AuthService } from './auth.service' // Adjust the import path as necessary
import { AuthGuard } from 'src/guards/auth.guard';
import { request } from 'http';     

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
    
    @Get('me')
    getUserInfo(@Request() request){
        return request.user; // Assuming the user information is stored in the request object by the AuthGuard
    }
}