import { Controller, Get, Post, Query, Body, Logger, BadRequestException } from '@nestjs/common';
import { OAuthService } from '../services/oauth.service';
import { BitrixApiService } from '../services/bitrix-api.service';

@Controller()
export class BitrixController {
  private readonly logger = new Logger(BitrixController.name);

  constructor(
    private readonly oauthService: OAuthService,
    private readonly bitrixApiService: BitrixApiService,
  ) {}

  /**
   * Endpoint xử lý sự kiện cài đặt ứng dụng từ Bitrix24
   */
  @Post('install')
  async installApp(
    @Query('code') code: string,
    @Query('domain') domain: string,
    @Body() body: any,
  ) {
    this.logger.log(`Install request received - Domain: ${domain}, Code: ${code ? 'present' : 'missing'}`);
    
    try {
      const result = await this.oauthService.handleInstall(code, domain);
      return result;
    } catch (error) {
      this.logger.error('Install failed:', error.message);
      throw error;
    }
  }

  /**
   * Endpoint GET để xử lý redirect từ Bitrix24 (backup)
   */
  @Get('install')
  async installAppGet(
    @Query('code') code: string,
    @Query('domain') domain: string,
  ) {
    this.logger.log(`Install GET request received - Domain: ${domain}, Code: ${code ? 'present' : 'missing'}`);
    
    try {
      const result = await this.oauthService.handleInstall(code, domain);
      return {
        ...result,
        message: 'App installed successfully! You can close this window.',
      };
    } catch (error) {
      this.logger.error('Install failed:', error.message);
      throw error;
    }
  }

  /**
   * Test endpoint để gọi API Bitrix24
   */
  @Get('test/contacts')
  async testContacts(@Query('domain') domain: string) {
    if (!domain) {
      throw new BadRequestException('Domain parameter is required');
    }

    try {
      this.logger.log(`Testing contacts API for domain: ${domain}`);
      const contacts = await this.bitrixApiService.getContacts(domain);
      return {
        success: true,
        data: contacts,
        message: 'Contacts retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Test contacts failed:', error.message);
      throw error;
    }
  }

  /**
   * Test endpoint để lấy thông tin user hiện tại
   */
  @Get('test/user')
  async testUser(@Query('domain') domain: string) {
    if (!domain) {
      throw new BadRequestException('Domain parameter is required');
    }

    try {
      this.logger.log(`Testing user API for domain: ${domain}`);
      const user = await this.bitrixApiService.getCurrentUser(domain);
      return {
        success: true,
        data: user,
        message: 'User info retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Test user failed:', error.message);
      throw error;
    }
  }

  /**
   * Test endpoint để lấy danh sách deals
   */
  @Get('test/deals')
  async testDeals(@Query('domain') domain: string) {
    if (!domain) {
      throw new BadRequestException('Domain parameter is required');
    }

    try {
      this.logger.log(`Testing deals API for domain: ${domain}`);
      const deals = await this.bitrixApiService.getDeals(domain);
      return {
        success: true,
        data: deals,
        message: 'Deals retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Test deals failed:', error.message);
      throw error;
    }
  }

  /**
   * Test endpoint để lấy danh sách leads
   */
  @Get('test/leads')
  async testLeads(@Query('domain') domain: string) {
    if (!domain) {
      throw new BadRequestException('Domain parameter is required');
    }

    try {
      this.logger.log(`Testing leads API for domain: ${domain}`);
      const leads = await this.bitrixApiService.getLeads(domain);
      return {
        success: true,
        data: leads,
        message: 'Leads retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Test leads failed:', error.message);
      throw error;
    }
  }

  /**
   * Health check endpoint
   */
  @Get('health')
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Bitrix OAuth service is running',
    };
  }
}
