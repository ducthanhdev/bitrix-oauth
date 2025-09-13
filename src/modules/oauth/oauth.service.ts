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
      this.logger.log(`Handling install for domain: ${domain}`);

      // Kiểm tra code có tồn tại
      if (!code) {
        throw new BadRequestException('Authorization code is required');
      }

      // Trao đổi code lấy access token
      const tokenData = await this.exchangeCodeForToken(code, domain);
      
      // Lưu token vào database
      await this.saveToken(domain, tokenData);

      this.logger.log(`Successfully installed app for domain: ${domain}`);
      return { success: true, message: 'App installed successfully' };
    } catch (error) {
      this.logger.error(`Install failed for domain ${domain}:`, error);
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
      const response = await firstValueFrom(
        this.httpService.post(tokenUrl, params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
      );

      return response.data;
    } catch (error) {
      this.logger.error('Token exchange failed:', error.response?.data || error.message);
      throw new BadRequestException('Failed to exchange code for token');
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

    // Xóa token cũ nếu có
    await this.tokenModel.deleteOne({ domain });

    // Lưu token mới
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

    // Kiểm tra token có hết hạn không
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

      // Cập nhật token
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
      
      // Đánh dấu token là không hợp lệ
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
}
