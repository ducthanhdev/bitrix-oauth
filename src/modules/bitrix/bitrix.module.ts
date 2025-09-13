import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BitrixApiService } from './bitrix-api.service';
import { BitrixController } from './bitrix.controller';
import { OAuthModule } from '../oauth/oauth.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    OAuthModule,
  ],
  controllers: [BitrixController],
  providers: [BitrixApiService],
  exports: [BitrixApiService],
})
export class BitrixModule {}
