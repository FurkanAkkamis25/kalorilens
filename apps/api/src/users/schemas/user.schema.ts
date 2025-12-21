import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true })
    email: string; // Firebase'den veya Auth'tan gelen

    @Prop()
    ad_soyad: string;

    @Prop({ default: 2000 })
    gunluk_kalori_hedefi: number;
}
export const UserSchema = SchemaFactory.createForClass(User);
