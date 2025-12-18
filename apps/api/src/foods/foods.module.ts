import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FoodsService } from './foods.service';
import { Food, FoodSchema } from './schemas/food.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Food.name, schema: FoodSchema }]),
    ],
    providers: [FoodsService],
    exports: [FoodsService],
})
export class FoodsModule { }
