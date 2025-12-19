import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import axios from 'axios';

@Injectable()
export class ProductsService {
    private readonly logger = new Logger(ProductsService.name);

    constructor(
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    ) { }

    async getProduct(barcode: string): Promise<Product | null> {
        // 1. Check local database
        const existingProduct = await this.productModel.findOne({ barcode }).exec();
        if (existingProduct) {
            this.logger.log(`Product found in DB: ${barcode}`);
            return existingProduct;
        }

        // 2. Fetch from OpenFoodFacts
        this.logger.log(`Product not found in DB, fetching from OpenFoodFacts: ${barcode}`);
        try {
            const response = await axios.get(
                `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
            );

            const data = response.data;
            this.logger.log(`OFF Response Status: ${data.status}`);
            // this.logger.debug(`OFF Full Data: ${JSON.stringify(data)}`); // Too large to log fully usually

            if (data.status === 0 || !data.product) {
                this.logger.warn(`Product not found on OpenFoodFacts: ${barcode}`);
                return null; // Or throw NotFoundException
            }

            const productData = data.product;

            // 3. Clean and map data
            const newProduct = new this.productModel({
                barcode: barcode,
                urun_adi: productData.product_name || 'Bilinmeyen Ürün',
                marka: productData.brands || 'Bilinmeyen Marka',
                gorsel_url: productData.image_url || '',
                kalori: productData.nutriments?.['energy-kcal_100g'] || 0,
                protein: productData.nutriments?.proteins_100g || 0,
                karbonhidrat: productData.nutriments?.carbohydrates_100g || 0,
                yag: productData.nutriments?.fat_100g || 0,
            });

            // 4. Save to database
            await newProduct.save();
            this.logger.log(`Product saved to DB: ${barcode}`);

            return newProduct;
        } catch (error) {
            this.logger.error(`Error fetching product from OpenFoodFacts: ${error.message}`);
            throw error;
        }
    }
}
