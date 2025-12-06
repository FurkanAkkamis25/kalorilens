import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { GoalsService } from '../goals/goals.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private goalsService: GoalsService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async register(createUserDto: CreateUserDto) {
        try {
            const user = await this.usersService.create(createUserDto);
            // Profil bilgileri varsa hedefleri hesapla
            if (user.age && user.weightKg && user.heightCm && user.activityLevel && user.goalType) {
                await this.goalsService.recalculateGoals(user.id);
            }
            return this.login(user);
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }
}
