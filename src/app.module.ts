import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BitrixController } from './controllers/bitrix.controller';
import { OAuthService } from './services/oauth.service';
import { BitrixApiService } from './services/bitrix-api.service';
import { Token, TokenSchema } from './schemas/token.schema';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('mongodb.uri'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  controllers: [AppController, BitrixController],
  providers: [AppService, OAuthService, BitrixApiService],
})
export class AppModule {}
