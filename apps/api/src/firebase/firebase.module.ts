import { Module, Global } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: 'FIREBASE_ADMIN',
            useFactory: (configService: ConfigService) => {
                // serviceAccountKey.json dosyasını import et veya oku
                // Not: require ile okumak en kolayıdır, ancak path'e dikkat etmek gerekir.
                // NestJS build sonrası dist klasöründe çalışacağı için dosyanın oraya kopyalanması veya
                // root dizinden okunması gerekir.
                // Basitlik için burada require kullanıyoruz.
                const serviceAccount = require('../../serviceAccountKey.json');

                return admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                });
            },
            inject: [ConfigService],
        },
    ],
    exports: ['FIREBASE_ADMIN'],
})
export class FirebaseModule { }
