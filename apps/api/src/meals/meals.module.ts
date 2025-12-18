import { Module } from '@nestjs/common';
import { MealsController } from './meals.controller';
import { MealsService } from './meals.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Meal, MealSchema } from './schemas/meal.schema';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Meal.name, schema: MealSchema }]),
    PrismaModule,
  ],
  controllers: [MealsController],
  providers: [MealsService],
})
export class MealsModule { }
