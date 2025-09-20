import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Token, TokenDocument } from '../../schemas/token.schema';

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
  ) {}

  /** Handle Bitrix24 app installation */
  async handleInstall(code: string, domain: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!code) {
        throw new BadRequestException('Authorization code is required');
      }

      if (!domain) {
        throw new BadRequestException('Domain is required');
      }

      if (code.startsWith('local.') || code.length > 50) {
        const tokenData = {
          access_token: code,
          refresh_token: code,
          expires_in: 3600,
        };
        await this.saveToken(domain, tokenData);
      } else {
        const tokenData = await this.exchangeCodeForToken(code, domain);
        await this.saveToken(domain, tokenData);
      }

      return { success: true, message: 'App installed successfully' };
    } catch (error) {
      this.logger.error(`Install failed for domain ${domain}:`, error.message);
      
      if (error.message.includes('Missing OAuth configuration')) {
        throw new BadRequestException('OAuth configuration is missing. Please check CLIENT_ID, CLIENT_SECRET, and REDIRECT_URI environment variables.');
      }
      
      if (error.message.includes('Failed to exchange code for token')) {
        throw new BadRequestException('Failed to exchange authorization code for access token. Please check your OAuth configuration and try again.');
      }
      
      throw error;
    }
  }

  /** Exchange authorization code for access token */
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
      
      if (response.data.error) {
        throw new BadRequestException(`Bitrix24 error: ${response.data.error_description || response.data.error}`);
      }

      return response.data;
    } catch (error) {
      if (error.response?.data?.error) {
        throw new BadRequestException(`Bitrix24 error: ${error.response.data.error_description || error.response.data.error}`);
      }
      
      throw new BadRequestException(`Failed to exchange code for token: ${error.message}`);
    }
  }

  /** Save token to database */
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
  }

  /** Get valid access token for domain */
  async getAccessToken(domain: string): Promise<string> {
    const token = await this.tokenModel.findOne({ domain, status: 'active' });
    
    if (!token) {
      throw new BadRequestException('No active token found for this domain');
    }

    if (new Date() >= token.expiresAt) {
      await this.refreshToken(domain);
      const refreshedToken = await this.tokenModel.findOne({ domain, status: 'active' });
      if (!refreshedToken) {
        throw new BadRequestException('Failed to refresh token');
      }
      return refreshedToken.accessToken;
    }

    return token.accessToken;
  }

  /** Refresh access token */
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
    } catch (error) {
      await this.tokenModel.updateOne({ domain }, { status: 'invalid' });
      throw new BadRequestException('Failed to refresh token');
    }
  }

  /** Ensure valid token and refresh if needed */
  async ensureValidToken(domain: string): Promise<string> {
    try {
      return await this.getAccessToken(domain);
    } catch (error) {
      this.logger.error(`Failed to get valid token for domain ${domain}:`, error.message);
      throw error;
    }
  }

  /** Get OAuth configuration */
  getOAuthConfig(): { clientId: string; clientSecret: string; redirectUri: string } {
    return {
      clientId: this.configService.get<string>('bitrix24.clientId') || '',
      clientSecret: this.configService.get<string>('bitrix24.clientSecret') || '',
      redirectUri: this.configService.get<string>('bitrix24.redirectUri') || '',
    };
  }
}
