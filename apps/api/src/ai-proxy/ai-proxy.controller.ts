import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiProxyService } from './ai-proxy.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('AI Proxy')
@ApiBearerAuth()
@Controller('ai')
export class AiProxyController {
    constructor(private readonly aiProxyService: AiProxyService) { }

    @Post('analyze')
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Yemek fotoğrafı analiz et' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    async analyze(@UploadedFile() file: Express.Multer.File) {
        return this.aiProxyService.analyzeImage(file.buffer, file.mimetype);
    }
}
