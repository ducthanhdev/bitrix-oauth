import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OAuthModule } from './modules/oauth/oauth.module';
import { BitrixModule } from './modules/bitrix/bitrix.module';
import { ContactModule } from './modules/contact/contact.module';
import { Token, TokenSchema } from './schemas/token.schema';
import { ApiKeyGuard } from './guards/api-key.guard';
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
    OAuthModule,
    BitrixModule,
    ContactModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
  ],
})
export class AppModule {}
