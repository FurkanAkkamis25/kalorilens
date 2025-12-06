import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MealDocument = HydratedDocument<Meal>;

@Schema({ timestamps: true })
export class Meal {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    name: string; // "Sabah Kahvaltısı"

    @Prop({ required: true })
    date: Date;

    @Prop()
    imageUrl?: string;

    @Prop({ type: Object })
    aiAnalysisResult?: any; // AI'dan gelen ham veri

    @Prop([
        {
            name: String,
            calories: Number,
            protein: Number,
            carbs: Number,
            fat: Number,
            amount: Number,
            unit: String,
        },
    ])
    foods: {
        name: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        amount: number;
        unit: string;
    }[];

    @Prop()
    totalCalories: number;

    @Prop()
    totalProtein: number;

    @Prop()
    totalCarbs: number;

    @Prop()
    totalFat: number;
}

export const MealSchema = SchemaFactory.createForClass(Meal);
