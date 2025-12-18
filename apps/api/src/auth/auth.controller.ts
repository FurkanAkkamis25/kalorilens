import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    @ApiOperation({ summary: 'Kullanıcı girişi' })
    @ApiResponse({ status: 200, description: 'Başarılı giriş.' })
    @ApiResponse({ status: 401, description: 'Geçersiz kimlik bilgileri.' })
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Geçersiz email veya şifre');
        }
        return this.authService.login(user);
    }

    @Post('register')
    @ApiOperation({ summary: 'Yeni kullanıcı kaydı' })
    @ApiResponse({ status: 201, description: 'Kullanıcı başarıyla oluşturuldu.' })
    async register(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto);
    }
    @Post('verify-token')
    @ApiOperation({ summary: 'Firebase Token Doğrulama' })
    @ApiResponse({ status: 200, description: 'Token geçerli.' })
    async verifyToken(@Body('token') token: string) {
        // Bu endpoint, client tarafında alınan Firebase token'ını doğrulamak için kullanılabilir.
        // Ancak genellikle guard'lar ile korunmuş route'larda otomatik yapılır.
        // Şimdilik boş bırakıyoruz veya test için kullanabiliriz.
        return { message: 'Token received', token };
    }
}
