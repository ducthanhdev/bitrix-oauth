import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const url = request.url;
    
    // Bỏ qua OAuth endpoints và health check
    if (url.startsWith('/install') || url.startsWith('/health') || url.startsWith('/test/')) {
      return true;
    }
    
    const apiKey = request.headers['x-api-key'];
    const validApiKey = this.configService.get<string>('API_KEY') || 'bitrix-oauth-default-key';

    if (!apiKey || apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid or missing API key');
    }

    return true;
  }
}
