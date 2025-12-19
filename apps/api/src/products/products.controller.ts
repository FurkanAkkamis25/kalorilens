import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get(':barcode')
    async getProduct(@Param('barcode') barcode: string) {
        const product = await this.productsService.getProduct(barcode);
        if (!product) {
            throw new NotFoundException('Product not found');
        }
        return product;
    }
}
