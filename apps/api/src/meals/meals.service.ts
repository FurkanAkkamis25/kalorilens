import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Meal, MealDocument } from './schemas/meal.schema';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMealDto } from './dto/create-meal.dto';

@Injectable()
export class MealsService {
    constructor(
        @InjectModel(Meal.name) private mealModel: Model<MealDocument>,
        private prisma: PrismaService,
    ) { }

    async create(createMealDto: CreateMealDto, userId: string) {
        // 1. MongoDB'ye kaydet (Detaylı log)
        const createdMeal = new this.mealModel({
            ...createMealDto,
            userId,
            date: new Date(),
        });
        await createdMeal.save();

        // 2. Postgres'e kaydet (Günlük Özet)
        // Bugünün tarihini al (saat bilgisini sıfırla)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Mevcut özeti bul veya oluştur
        const summary = await this.prisma.dailySummary.upsert({
            where: {
                userId_date: {
                    userId,
                    date: today,
                },
            },
            update: {
                totalKcal: { increment: createMealDto.totalCalories },
                totalProtein: { increment: createMealDto.totalProtein },
                totalCarb: { increment: createMealDto.totalCarbs },
                totalFat: { increment: createMealDto.totalFat },
            },
            create: {
                userId,
                date: today,
                totalKcal: createMealDto.totalCalories,
                totalProtein: createMealDto.totalProtein,
                totalCarb: createMealDto.totalCarbs,
                totalFat: createMealDto.totalFat,
            },
        });

        return { meal: createdMeal, summary };
    }
}
