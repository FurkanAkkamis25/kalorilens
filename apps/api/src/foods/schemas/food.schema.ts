import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FoodDocument = Food & Document;

@Schema()
export class Food {
    @Prop({ required: true, unique: true })
    slug: string; // E.g., 'kuru_fasulye', matches AI label

    @Prop({ required: true })
    name: string; // E.g., 'Kuru Fasulye'

    @Prop({ required: true })
    calories: number; // per 100g

    @Prop({ required: true })
    protein: number;

    @Prop({ required: true })
    carbohydrate: number;

    @Prop({ required: true })
    fat: number;

    @Prop()
    image_url: string;
}

export const FoodSchema = SchemaFactory.createForClass(Food);
