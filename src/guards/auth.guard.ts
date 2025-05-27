import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt"; // Assuming JwtService is used for token validation
@Injectable()
export class AuthGuard implements CanActivate {
    // Triển khai phương thức canActivate để xác định quyền truy cập
    constructor(private jwtService: JwtService) {} // Assuming JwtService is used for token validation
    async canActivate(context: ExecutionContext){
        const request = context.switchToHttp().getRequest();
        const authorization = request.headers.authorization;
        const token = authorization?.split(' ')[1]; // Giả sử token được gửi trong header Authorization
        
        if (!token) {
            throw new UnauthorizedException();// Không có token, từ chối truy cập
        }
        try {
            const tokenPayload =  await this.jwtService.decode(token); // Giải mã token để lấy payload
            request.user = {
                userId: tokenPayload.sub,
                username: tokenPayload.username,
            }
            return true; // Token hợp lệ, cho phép truy cập
        }
        catch (error) {
            throw new UnauthorizedException('Invalid token'); // Token không hợp lệ, từ chối truy cập
        }
    }
} 