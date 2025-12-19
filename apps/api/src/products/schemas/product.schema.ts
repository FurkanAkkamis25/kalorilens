import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Product {
    @Prop({ required: true, unique: true, index: true })
    barcode: string;

    @Prop()
    urun_adi: string;

    @Prop()
    marka: string;

    @Prop()
    gorsel_url: string;

    @Prop()
    kalori: number;

    @Prop()
    protein: number;

    @Prop()
    karbonhidrat: number;

    @Prop()
    yag: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
