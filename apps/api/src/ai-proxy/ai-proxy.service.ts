import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';

@Injectable()
export class AiProxyService {
    private aiServiceUrl: string;

    constructor(
        private httpService: HttpService,
        private configService: ConfigService,
    ) {
        this.aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL') || 'http://localhost:5000';
    }

    async analyzeImage(imageBuffer: Buffer, mimeType: string) {
        try {
            const formData = new FormData();
            formData.append('file', imageBuffer, {
                filename: 'image.jpg',
                contentType: mimeType,
            });

            const response = await firstValueFrom(
                this.httpService.post(`${this.aiServiceUrl}/predict`, formData, {
                    headers: {
                        ...formData.getHeaders(),
                    },
                }),
            );
            return response.data;
        } catch (error) {
            throw new HttpException(
                error.response?.data || 'AI Service Error',
                error.response?.status || HttpStatus.BAD_GATEWAY,
            );
        }
    }
}
