import { Controller, Get, Query, Logger, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BitrixApiService } from './bitrix-api.service';

@ApiTags('Bitrix Test')
@Controller('test')
export class BitrixController {
  private readonly logger = new Logger(BitrixController.name);

  constructor(private readonly bitrixApiService: BitrixApiService) {}

  /** Test Bitrix24 contacts API */
  @Get('contacts')
  @ApiOperation({ summary: 'Test API lấy danh sách contacts từ Bitrix24' })
  @ApiQuery({ name: 'domain', description: 'Domain Bitrix24', example: 'your-domain.bitrix24.com' })
  @ApiResponse({ status: 200, description: 'Test thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  async testContacts(@Query('domain') domain: string) {
    if (!domain) {
      throw new BadRequestException('Domain parameter is required');
    }

    try {
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

  /** Test Bitrix24 user API */
  @Get('user')
  @ApiOperation({ summary: 'Test API lấy thông tin user hiện tại từ Bitrix24' })
  @ApiQuery({ name: 'domain', description: 'Domain Bitrix24', example: 'your-domain.bitrix24.com' })
  @ApiResponse({ status: 200, description: 'Test thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  async testUser(@Query('domain') domain: string) {
    if (!domain) {
      throw new BadRequestException('Domain parameter is required');
    }

    try {
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

  /** Test Bitrix24 deals API */
  @Get('deals')
  @ApiOperation({ summary: 'Test API lấy danh sách deals từ Bitrix24' })
  @ApiQuery({ name: 'domain', description: 'Domain Bitrix24', example: 'your-domain.bitrix24.com' })
  @ApiResponse({ status: 200, description: 'Test thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  async testDeals(@Query('domain') domain: string) {
    if (!domain) {
      throw new BadRequestException('Domain parameter is required');
    }

    try {
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

  /** Test Bitrix24 leads API */
  @Get('leads')
  @ApiOperation({ summary: 'Test API lấy danh sách leads từ Bitrix24' })
  @ApiQuery({ name: 'domain', description: 'Domain Bitrix24', example: 'your-domain.bitrix24.com' })
  @ApiResponse({ status: 200, description: 'Test thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  async testLeads(@Query('domain') domain: string) {
    if (!domain) {
      throw new BadRequestException('Domain parameter is required');
    }

    try {
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
}
