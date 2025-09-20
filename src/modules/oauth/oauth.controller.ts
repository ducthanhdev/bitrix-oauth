import { Controller, Get, Post, Query, Body, Logger, BadRequestException, Req } from '@nestjs/common';
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
   * Bitrix24 có thể gửi data trong body hoặc query parameters
   * 
   * @param code - Authorization code từ Bitrix24 (query hoặc body)
   * @param domain - Domain của Bitrix24 (query hoặc body)
   * @param body - Request body
   * @returns Kết quả cài đặt ứng dụng
   */
  @Post('install')
  @ApiOperation({ summary: 'Cài đặt ứng dụng từ Bitrix24 (POST)' })
  @ApiQuery({ name: 'code', description: 'Authorization code từ Bitrix24', required: false })
  @ApiQuery({ name: 'domain', description: 'Domain Bitrix24', example: 'your-domain.bitrix24.com', required: false })
  @ApiBody({ 
    description: 'Request body từ Bitrix24',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Authorization code' },
        domain: { type: 'string', description: 'Domain Bitrix24' },
        member_id: { type: 'string', description: 'Member ID' },
        event_token: { type: 'string', description: 'Event token' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Ứng dụng được cài đặt thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  async installApp(
    @Query('code') queryCode: string,
    @Query('domain') queryDomain: string,
    @Body() body: any,
  ) {
    // Xử lý format request từ Bitrix24
    let code, domain;
    
    if (body?.AUTH_ID) {
      // Format mới từ Bitrix24: sử dụng AUTH_ID làm code
      code = body.AUTH_ID;
      
      // Lấy domain từ query parameter hoặc từ member_id
      if (queryDomain) {
        domain = queryDomain;
      } else if (body?.member_id) {
        // Có thể domain được gửi trong member_id hoặc cần lấy từ context khác
        // Tạm thời sử dụng domain mặc định hoặc yêu cầu user cung cấp
        domain = 'ducthanh.bitrix24.vn'; // Domain mặc định, user cần cập nhật
        this.logger.warn(`Domain not provided, using default: ${domain}`);
      } else {
        domain = queryDomain;
      }
      
      this.logger.log(`Bitrix24 format detected - AUTH_ID: ${code}, Domain: ${domain}`);
    } else {
      // Format cũ: code và domain từ body hoặc query
      code = body?.code || queryCode;
      domain = body?.domain || queryDomain;
    }
    
    this.logger.log(`Install POST request received - Domain: ${domain}, Code: ${code ? 'present' : 'missing'}`);
    this.logger.log(`Query params - code: ${queryCode}, domain: ${queryDomain}`);
    this.logger.log(`Body params - code: ${body?.code}, domain: ${body?.domain}`);
    this.logger.log(`Body AUTH_ID: ${body?.AUTH_ID}`);
    this.logger.log(`Final values - code: ${code}, domain: ${domain}`);
    this.logger.log(`Full request body:`, body);
    
    try {
      const result = await this.oauthService.handleInstall(code, domain);
      this.logger.log(`Install successful for domain: ${domain}`);
      return result;
    } catch (error) {
      this.logger.error('Install POST failed:', {
        error: error.message,
        domain: domain,
        code: code ? 'present' : 'missing',
        queryCode: queryCode,
        queryDomain: queryDomain,
        bodyCode: body?.code,
        bodyDomain: body?.domain,
        authId: body?.AUTH_ID
      });
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
      this.logger.log(`Install GET successful for domain: ${domain}`);
      return {
        ...result,
        message: 'App installed successfully! You can close this window.',
      };
    } catch (error) {
      this.logger.error('Install GET failed:', {
        error: error.message,
        domain: domain,
        code: code ? 'present' : 'missing'
      });
      throw error;
    }
  }

  /**
   * Test endpoint để kiểm tra OAuth configuration
   * 
   * @returns Thông tin cấu hình OAuth
   */
  @Get('test/config')
  @ApiOperation({ summary: 'Kiểm tra cấu hình OAuth' })
  @ApiResponse({ status: 200, description: 'Thông tin cấu hình OAuth' })
  async testConfig() {
    const config = this.oauthService.getOAuthConfig();
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      config: {
        clientId: config.clientId ? 'configured' : 'missing',
        clientSecret: config.clientSecret ? 'configured' : 'missing',
        redirectUri: config.redirectUri || 'not configured',
      },
      message: 'OAuth configuration check completed',
    };
  }

  /**
   * Debug endpoint để kiểm tra request từ Bitrix24
   * 
   * @param req - Request object
   * @returns Thông tin chi tiết về request
   */
  @Post('debug/install')
  @ApiOperation({ summary: 'Debug endpoint để kiểm tra request từ Bitrix24' })
  @ApiResponse({ status: 200, description: 'Thông tin debug request' })
  async debugInstall(@Body() body: any, @Query() query: any, @Req() req: any) {
    this.logger.log('=== DEBUG INSTALL REQUEST ===');
    this.logger.log('Headers:', req.headers);
    this.logger.log('Query params:', query);
    this.logger.log('Body:', body);
    this.logger.log('Method:', req.method);
    this.logger.log('URL:', req.url);
    this.logger.log('================================');
    
    return {
      status: 'debug',
      timestamp: new Date().toISOString(),
      request: {
        method: req.method,
        url: req.url,
        headers: req.headers,
        query: query,
        body: body,
      },
      message: 'Debug information logged to console',
    };
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
