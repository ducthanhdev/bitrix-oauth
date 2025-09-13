import { Controller, Get, Post, Query, Body, Logger, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { OAuthService } from './oauth.service';

/**
 * OAuth Controller - Xử lý các endpoint OAuth với Bitrix24
 * 
 * Chức năng:
 * - Nhận sự kiện cài đặt ứng dụng từ Bitrix24
 * - Xử lý OAuth flow và trao đổi token
 * - Cung cấp test endpoints để kiểm tra kết nối
 */
@ApiTags('OAuth')
@Controller()
export class OAuthController {
  private readonly logger = new Logger(OAuthController.name);

  constructor(private readonly oauthService: OAuthService) {}

  /**
   * Endpoint xử lý sự kiện cài đặt ứng dụng từ Bitrix24 (POST)
   * 
   * @param code - Authorization code từ Bitrix24
   * @param domain - Domain của Bitrix24
   * @param body - Request body
   * @returns Kết quả cài đặt ứng dụng
   */
  @Post('install')
  @ApiOperation({ summary: 'Cài đặt ứng dụng từ Bitrix24 (POST)' })
  @ApiQuery({ name: 'code', description: 'Authorization code từ Bitrix24' })
  @ApiQuery({ name: 'domain', description: 'Domain Bitrix24', example: 'your-domain.bitrix24.com' })
  @ApiResponse({ status: 200, description: 'Ứng dụng được cài đặt thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
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
   * Endpoint xử lý sự kiện cài đặt ứng dụng từ Bitrix24 (GET)
   * Backup method cho trường hợp redirect từ Bitrix24
   * 
   * @param code - Authorization code từ Bitrix24
   * @param domain - Domain của Bitrix24
   * @returns Kết quả cài đặt ứng dụng với thông báo user-friendly
   */
  @Get('install')
  @ApiOperation({ summary: 'Cài đặt ứng dụng từ Bitrix24 (GET)' })
  @ApiQuery({ name: 'code', description: 'Authorization code từ Bitrix24' })
  @ApiQuery({ name: 'domain', description: 'Domain Bitrix24', example: 'your-domain.bitrix24.com' })
  @ApiResponse({ status: 200, description: 'Ứng dụng được cài đặt thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
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
   * Health check endpoint
   * 
   * @returns Trạng thái hoạt động của service
   */
  @Get('health')
  @ApiOperation({ summary: 'Kiểm tra trạng thái hoạt động của service' })
  @ApiResponse({ status: 200, description: 'Service đang hoạt động bình thường' })
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Bitrix OAuth service is running',
    };
  }
}
