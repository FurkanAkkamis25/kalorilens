import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Food, FoodDocument } from './schemas/food.schema';

@Injectable()
export class FoodsService {
    constructor(@InjectModel(Food.name) private foodModel: Model<FoodDocument>) { }

    async findBySlug(slug: string): Promise<Food | null> {
        return this.foodModel.findOne({ slug }).exec();
    }
}
