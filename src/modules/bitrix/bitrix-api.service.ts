import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { OAuthService } from '../oauth/oauth.service';

/**
 * Bitrix API Service - Xử lý các API calls tới Bitrix24
 * 
 * Chức năng chính:
 * - Gọi các API Bitrix24 với access token hợp lệ
 * - Xử lý lỗi và retry logic
 * - Cung cấp các method tiện ích cho các API phổ biến
 * - Logging chi tiết cho debug
 */
@Injectable()
export class BitrixApiService {
  private readonly logger = new Logger(BitrixApiService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly oauthService: OAuthService,
  ) {}

  /**
   * Gọi API Bitrix24 với method và payload tùy chỉnh
   * 
   * @param domain - Domain Bitrix24
   * @param method - Method API (ví dụ: crm.contact.list)
   * @param payload - Dữ liệu gửi đi
   * @returns Response từ Bitrix24 API
   */
  async callBitrixAPI(
    domain: string,
    method: string,
    payload: any = {},
  ): Promise<any> {
    try {
      // Lấy access token hợp lệ
      const accessToken = await this.oauthService.ensureValidToken(domain);
      
      // Tạo URL API
      const apiUrl = `https://${domain}/rest/1/${accessToken}/${method}`;
      
      this.logger.log(`Calling Bitrix24 API: ${method} for domain: ${domain}`);

      // Gọi API
      const response = await firstValueFrom(
        this.httpService.post(apiUrl, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 seconds timeout
        })
      );

      // Kiểm tra response từ Bitrix24
      if (response.data.error) {
        this.logger.error(`Bitrix24 API error:`, response.data.error);
        throw new BadRequestException(`Bitrix24 API error: ${response.data.error_description || response.data.error}`);
      }

      this.logger.log(`API call successful: ${method}`);
      return response.data;

    } catch (error) {
      this.logger.error(`API call failed for method ${method}:`, error.message);
      
      // Xử lý các loại lỗi khác nhau
      if (error.code === 'ECONNABORTED') {
        throw new BadRequestException('Request timeout - Bitrix24 server is not responding');
      }
      
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw new BadRequestException(`Client error: ${error.response.status} - ${error.response.statusText}`);
      }
      
      if (error.response?.status >= 500) {
        throw new BadRequestException(`Server error: ${error.response.status} - Bitrix24 server error`);
      }
      
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new BadRequestException('Network error - Cannot connect to Bitrix24 server');
      }

      throw error;
    }
  }

  /**
   * Lấy danh sách contact từ Bitrix24
   * 
   * @param domain - Domain Bitrix24
   * @param filters - Bộ lọc tìm kiếm
   * @returns Danh sách contacts
   */
  async getContacts(domain: string, filters: any = {}): Promise<any> {
    const payload = {
      select: ['ID', 'NAME', 'LAST_NAME', 'EMAIL', 'PHONE'],
      filter: filters,
      start: 0,
    };

    return await this.callBitrixAPI(domain, 'crm.contact.list', payload);
  }

  /**
   * Lấy thông tin user hiện tại
   * 
   * @param domain - Domain Bitrix24
   * @returns Thông tin user
   */
  async getCurrentUser(domain: string): Promise<any> {
    return await this.callBitrixAPI(domain, 'user.current');
  }

  /**
   * Lấy danh sách deal
   * 
   * @param domain - Domain Bitrix24
   * @param filters - Bộ lọc tìm kiếm
   * @returns Danh sách deals
   */
  async getDeals(domain: string, filters: any = {}): Promise<any> {
    const payload = {
      select: ['ID', 'TITLE', 'STAGE_ID', 'OPPORTUNITY', 'CURRENCY_ID'],
      filter: filters,
      start: 0,
    };

    return await this.callBitrixAPI(domain, 'crm.deal.list', payload);
  }

  /**
   * Lấy danh sách lead
   * 
   * @param domain - Domain Bitrix24
   * @param filters - Bộ lọc tìm kiếm
   * @returns Danh sách leads
   */
  async getLeads(domain: string, filters: any = {}): Promise<any> {
    const payload = {
      select: ['ID', 'TITLE', 'STATUS_ID', 'SOURCE_ID', 'OPPORTUNITY'],
      filter: filters,
      start: 0,
    };

    return await this.callBitrixAPI(domain, 'crm.lead.list', payload);
  }
}
