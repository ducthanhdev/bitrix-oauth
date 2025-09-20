import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Token, TokenDocument } from '../../schemas/token.schema';

/**
 * OAuth Service - Xử lý logic OAuth 2.0 với Bitrix24
 * 
 * Chức năng chính:
 * - Xử lý sự kiện cài đặt ứng dụng từ Bitrix24
 * - Trao đổi authorization code lấy access token
 * - Lưu trữ và quản lý token trong MongoDB
 * - Tự động làm mới token khi hết hạn
 * - Xử lý lỗi OAuth và logging chi tiết
 */
@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
  ) {}

  /**
   * Xử lý sự kiện cài đặt ứng dụng từ Bitrix24
   * 
   * @param code - Authorization code từ Bitrix24
   * @param domain - Domain của Bitrix24
   * @returns Kết quả cài đặt ứng dụng
   */
  async handleInstall(code: string, domain: string): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`Handling install for domain: ${domain}, code: ${code ? 'present' : 'missing'}`);

      if (!code) {
        this.logger.error('Authorization code is missing');
        throw new BadRequestException('Authorization code is required');
      }

      if (!domain) {
        this.logger.error('Domain is missing');
        throw new BadRequestException('Domain is required');
      }

      // Validate domain format
      if (!domain.includes('.bitrix24.') && !domain.includes('.bitrix24.com')) {
        this.logger.warn(`Domain format might be incorrect: ${domain}`);
      }

      // Kiểm tra xem code có phải là AUTH_ID (access token) không
      if (code.startsWith('local.') || code.length > 50) {
        this.logger.log(`AUTH_ID detected, treating as access token for domain: ${domain}`);
        // AUTH_ID là access token, không cần exchange
        const tokenData = {
          access_token: code,
          refresh_token: code, // Tạm thời sử dụng AUTH_ID làm refresh token
          expires_in: 3600, // Mặc định 1 giờ
        };
        
        this.logger.log(`Saving AUTH_ID as access token for domain: ${domain}`);
        await this.saveToken(domain, tokenData);
      } else {
        this.logger.log(`Starting token exchange for domain: ${domain}`);
        const tokenData = await this.exchangeCodeForToken(code, domain);
        
        this.logger.log(`Token exchange successful, saving token for domain: ${domain}`);
        await this.saveToken(domain, tokenData);
      }

      this.logger.log(`Successfully installed app for domain: ${domain}`);
      return { success: true, message: 'App installed successfully' };
    } catch (error) {
      this.logger.error(`Install failed for domain ${domain}:`, {
        error: error.message,
        code: code ? 'present' : 'missing',
        domain: domain,
        stack: error.stack
      });
      
      // Provide more specific error messages
      if (error.message.includes('Missing OAuth configuration')) {
        throw new BadRequestException('OAuth configuration is missing. Please check CLIENT_ID, CLIENT_SECRET, and REDIRECT_URI environment variables.');
      }
      
      if (error.message.includes('Failed to exchange code for token')) {
        throw new BadRequestException('Failed to exchange authorization code for access token. Please check your OAuth configuration and try again.');
      }
      
      throw error;
    }
  }

  /**
   * Trao đổi authorization code lấy access token
   * 
   * @param code - Authorization code
   * @param domain - Domain Bitrix24
   * @returns Token data từ Bitrix24
   */
  private async exchangeCodeForToken(code: string, domain: string): Promise<any> {
    const clientId = this.configService.get<string>('bitrix24.clientId');
    const clientSecret = this.configService.get<string>('bitrix24.clientSecret');
    const redirectUri = this.configService.get<string>('bitrix24.redirectUri');

    if (!clientId || !clientSecret || !redirectUri) {
      throw new BadRequestException('Missing OAuth configuration');
    }

    const tokenUrl = `https://${domain}/oauth/token/`;
    
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code: code,
    });

    try {
      this.logger.log(`Exchanging code for token - URL: ${tokenUrl}`);
      this.logger.log(`Request params: ${params.toString()}`);
      
      const response = await firstValueFrom(
        this.httpService.post(tokenUrl, params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
      );

      this.logger.log(`Token exchange response:`, response.data);
      
      if (response.data.error) {
        this.logger.error('Bitrix24 returned error:', response.data);
        throw new BadRequestException(`Bitrix24 error: ${response.data.error_description || response.data.error}`);
      }

      return response.data;
    } catch (error) {
      this.logger.error('Token exchange failed:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      if (error.response?.data?.error) {
        throw new BadRequestException(`Bitrix24 error: ${error.response.data.error_description || error.response.data.error}`);
      }
      
      throw new BadRequestException(`Failed to exchange code for token: ${error.message}`);
    }
  }

  /**
   * Lưu token vào database
   * 
   * @param domain - Domain Bitrix24
   * @param tokenData - Dữ liệu token từ Bitrix24
   */
  private async saveToken(domain: string, tokenData: any): Promise<void> {
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    await this.tokenModel.deleteOne({ domain });
    const token = new this.tokenModel({
      domain,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      expiresAt,
      status: 'active',
    });

    await token.save();
    this.logger.log(`Token saved for domain: ${domain}`);
  }

  /**
   * Lấy access token hiện tại cho domain
   * 
   * @param domain - Domain Bitrix24
   * @returns Access token hợp lệ
   */
  async getAccessToken(domain: string): Promise<string> {
    const token = await this.tokenModel.findOne({ domain, status: 'active' });
    
    if (!token) {
      throw new BadRequestException('No active token found for this domain');
    }

    if (new Date() >= token.expiresAt) {
      this.logger.log(`Token expired for domain: ${domain}, refreshing...`);
      await this.refreshToken(domain);
      const refreshedToken = await this.tokenModel.findOne({ domain, status: 'active' });
      if (!refreshedToken) {
        throw new BadRequestException('Failed to refresh token');
      }
      return refreshedToken.accessToken;
    }

    return token.accessToken;
  }

  /**
   * Làm mới access token
   * 
   * @param domain - Domain Bitrix24
   */
  async refreshToken(domain: string): Promise<void> {
    const token = await this.tokenModel.findOne({ domain, status: 'active' });
    
    if (!token) {
      throw new BadRequestException('No token found to refresh');
    }

    const clientId = this.configService.get<string>('bitrix24.clientId');
    const clientSecret = this.configService.get<string>('bitrix24.clientSecret');

    if (!clientId || !clientSecret) {
      throw new BadRequestException('Missing OAuth configuration for refresh');
    }

    const tokenUrl = `https://${domain}/oauth/token/`;
    
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: token.refreshToken,
    });

    try {
      const response = await firstValueFrom(
        this.httpService.post(tokenUrl, params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
      );

      const tokenData = response.data;
      const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

      await this.tokenModel.updateOne(
        { domain },
        {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresIn: tokenData.expires_in,
          expiresAt,
        }
      );

      this.logger.log(`Token refreshed for domain: ${domain}`);
    } catch (error) {
      this.logger.error(`Token refresh failed for domain ${domain}:`, error.response?.data || error.message);
      
      await this.tokenModel.updateOne({ domain }, { status: 'invalid' });
      throw new BadRequestException('Failed to refresh token');
    }
  }

  /**
   * Kiểm tra và làm mới token nếu cần
   * 
   * @param domain - Domain Bitrix24
   * @returns Access token hợp lệ
   */
  async ensureValidToken(domain: string): Promise<string> {
    try {
      return await this.getAccessToken(domain);
    } catch (error) {
      this.logger.error(`Failed to get valid token for domain ${domain}:`, error.message);
      throw error;
    }
  }

  /**
   * Kiểm tra cấu hình OAuth
   * 
   * @returns Thông tin cấu hình OAuth
   */
  getOAuthConfig(): { clientId: string; clientSecret: string; redirectUri: string } {
    return {
      clientId: this.configService.get<string>('bitrix24.clientId') || '',
      clientSecret: this.configService.get<string>('bitrix24.clientSecret') || '',
      redirectUri: this.configService.get<string>('bitrix24.redirectUri') || '',
    };
  }
}
