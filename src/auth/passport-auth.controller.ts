import { 
    Controller, 
    HttpCode, 
    HttpStatus,
    Post,
    Body,
    Request,
    Get,
    UseGuards,
    NotAcceptableException,
    } from '@nestjs/common';
import { AuthService } from './auth.service'; // Adjust the import path as necessary
import { PassportLocalGuard } from 'src/guards/passport-local.guard';

@Controller('auth-v2')
export class PassportAuthController {

    constructor(private authService: AuthService) { 
        // Constructor can be used for dependency injection if needed
    }


    @HttpCode(HttpStatus.OK)
    @Post('login')
    @UseGuards(PassportLocalGuard)
    login(@Request() request) {
        return this.authService.signIn(request.user); // Assuming the user information is stored in the request object by the PassportLocalGuard
    }
    @Get('me')
    @UseGuards(PassportLocalGuard)
    getUserInfo(@Request() request) {
        return request.user;
    }
}