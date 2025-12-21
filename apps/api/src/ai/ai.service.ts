import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(private configService: ConfigService) {
        this.genAI = new GoogleGenerativeAI(this.configService.get<string>('GEMINI_API_KEY') || '');
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }

    async predictFood(imageBuffer: Buffer, mimeType: string) {
        try {
            const prompt = `
        Sen uzman bir diyetisyensin. Bu fotoğraftaki yemeği analiz et.
        Görevin:
        1. Yemeğin ne olduğunu tespit et.
        2. Görselden porsiyon (gramaj) tahmini yap.
        3. Buna göre kalori ve makroları hesapla.

        Cevabı SADECE şu JSON formatında ver (Markdown yok):
        {
          "food_name": "Yemek Adı",
          "estimated_grams": Tahmini gram (Sayı),
          "calories": Toplam kalori (Sayı),
          "protein": Protein (gr),
          "fat": Yağ (gr),
          "carbs": Karbonhidrat (gr),
          "portion_reasoning": "Tahmin sebebi (Örn: Tabakta 200gr pilav görünüyor)"
        }
      `;

            const imagePart = {
                inlineData: { data: imageBuffer.toString('base64'), mimeType: mimeType },
            };

            const result = await this.model.generateContent([prompt, imagePart]);
            const response = result.response.text();
            // Temizlik yapıp JSON dönüyoruz
            const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleaned);
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('AI Analizi Başarısız');
        }
    }
}
