import { Controller, Get, Post, UploadedFile, UseInterceptors, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { AiProxyService } from './ai-proxy/ai-proxy.service';
import { FoodsService } from './foods/foods.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly aiProxyService: AiProxyService,
    private readonly foodsService: FoodsService
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('predict')
  @UseInterceptors(FileInterceptor('file'))
  async predictFood(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Resim dosyası yüklenmedi.');
    }

    try {
      // 1. AI Servisine Resim Gönder
      const aiResponse = await this.aiProxyService.analyzeImage(file.buffer, file.mimetype);
      const predictedLabel = aiResponse.label; // örn: "kuru_fasulye"

      // 2. Veritabanında Ara
      const food = await this.foodsService.findBySlug(predictedLabel);

      if (food) {
        return {
          food_name: food.name,
          calories: food.calories,
          protein: food.protein,
          fat: food.fat,
          carbohydrate: food.carbohydrate,
          image_url: food.image_url || aiResponse.image_url || "https://via.placeholder.com/150",
          match_score: aiResponse.score
        };
      } else {
        // Veritabanında (Foods Collection) henüz veri yoksa (Mehmet Emin doldurana kadar):
        return {
          food_name: predictedLabel,
          calories: 0,
          protein: 0,
          warning: "Veritabanında eşleşen yemek bulunamadı (foods collection boş olabilir).",
          match_score: aiResponse.score
        };
      }

    } catch (error) {
      console.error("Prediction Flow Error:", error);
      throw new InternalServerErrorException("Tahmin işlemi başarısız.", error.message);
    }
  }
}
