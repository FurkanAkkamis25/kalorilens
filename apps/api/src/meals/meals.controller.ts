import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { MealsService } from './meals.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Meals')
@ApiBearerAuth()
@Controller('meals')
export class MealsController {
    constructor(private readonly mealsService: MealsService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Yemek kaydet' })
    create(@Body() createMealDto: CreateMealDto, @Request() req) {
        return this.mealsService.create(createMealDto, req.user.userId); // userId comes from JwtStrategy
    }
}
