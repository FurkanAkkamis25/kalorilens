import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DailyLogDocument = DailyLog & Document;

class FoodEntry {
    @Prop() name: string;
    @Prop() calories: number;
    @Prop() amount: number; // gram
    @Prop() protein: number;
    @Prop() fat: number;
    @Prop() carbs: number;
}

@Schema({ timestamps: true })
export class DailyLog {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user_id: string;

    @Prop({ required: true })
    date: string; // Format: "2025-12-21"

    @Prop({ default: 0 })
    total_calories_in: number;

    @Prop({ type: [FoodEntry], default: [] })
    foods: FoodEntry[];
}
export const DailyLogSchema = SchemaFactory.createForClass(DailyLog);
