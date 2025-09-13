import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { BitrixApiService } from '../../modules/bitrix/bitrix-api.service';
import { OAuthService } from '../../modules/oauth/oauth.service';

describe('BitrixApiService', () => {
  let service: BitrixApiService;
  let httpService: HttpService;
  let oauthService: OAuthService;

  const mockHttpService = {
    post: jest.fn(),
  };

  const mockOAuthService = {
    ensureValidToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BitrixApiService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: OAuthService,
          useValue: mockOAuthService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BitrixApiService>(BitrixApiService);
    httpService = module.get<HttpService>(HttpService);
    oauthService = module.get<OAuthService>(OAuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('callBitrixAPI', () => {
    it('should successfully call Bitrix24 API', async () => {
      // Arrange
      const domain = 'test.bitrix24.com';
      const method = 'crm.contact.list';
      const payload = { select: ['ID', 'NAME'] };
      const accessToken = 'test-access-token';
      const expectedResponse = {
        data: {
          result: [{ ID: '1', NAME: 'Test Contact' }],
        },
      };

      mockOAuthService.ensureValidToken.mockResolvedValue(accessToken);
      mockHttpService.post.mockReturnValue(of(expectedResponse));

      // Act
      const result = await service.callBitrixAPI(domain, method, payload);

      // Assert
      expect(mockOAuthService.ensureValidToken).toHaveBeenCalledWith(domain);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        `https://${domain}/rest/1/${accessToken}/${method}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        },
      );
      expect(result).toEqual(expectedResponse.data);
    });

    it('should handle Bitrix24 API error response', async () => {
      // Arrange
      const domain = 'test.bitrix24.com';
      const method = 'crm.contact.list';
      const accessToken = 'test-access-token';
      const errorResponse = {
        data: {
          error: 'INVALID_TOKEN',
          error_description: 'Token is invalid',
        },
      };

      mockOAuthService.ensureValidToken.mockResolvedValue(accessToken);
      mockHttpService.post.mockReturnValue(of(errorResponse));

      // Act & Assert
      await expect(service.callBitrixAPI(domain, method)).rejects.toThrow(
        'Bitrix24 API error: Token is invalid',
      );
    });

    it('should handle network timeout error', async () => {
      // Arrange
      const domain = 'test.bitrix24.com';
      const method = 'crm.contact.list';
      const accessToken = 'test-access-token';
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded',
      };

      mockOAuthService.ensureValidToken.mockResolvedValue(accessToken);
      mockHttpService.post.mockReturnValue(throwError(() => timeoutError));

      // Act & Assert
      await expect(service.callBitrixAPI(domain, method)).rejects.toThrow(
        'Request timeout - Bitrix24 server is not responding',
      );
    });

    it('should handle 4xx client error', async () => {
      // Arrange
      const domain = 'test.bitrix24.com';
      const method = 'crm.contact.list';
      const accessToken = 'test-access-token';
      const clientError = {
        response: {
          status: 401,
          statusText: 'Unauthorized',
        },
      };

      mockOAuthService.ensureValidToken.mockResolvedValue(accessToken);
      mockHttpService.post.mockReturnValue(throwError(() => clientError));

      // Act & Assert
      await expect(service.callBitrixAPI(domain, method)).rejects.toThrow(
        'Client error: 401 - Unauthorized',
      );
    });

    it('should handle 5xx server error', async () => {
      // Arrange
      const domain = 'test.bitrix24.com';
      const method = 'crm.contact.list';
      const accessToken = 'test-access-token';
      const serverError = {
        response: {
          status: 500,
          statusText: 'Internal Server Error',
        },
      };

      mockOAuthService.ensureValidToken.mockResolvedValue(accessToken);
      mockHttpService.post.mockReturnValue(throwError(() => serverError));

      // Act & Assert
      await expect(service.callBitrixAPI(domain, method)).rejects.toThrow(
        'Server error: 500 - Bitrix24 server error',
      );
    });

    it('should handle network connection error', async () => {
      // Arrange
      const domain = 'test.bitrix24.com';
      const method = 'crm.contact.list';
      const accessToken = 'test-access-token';
      const networkError = {
        code: 'ENOTFOUND',
        message: 'getaddrinfo ENOTFOUND test.bitrix24.com',
      };

      mockOAuthService.ensureValidToken.mockResolvedValue(accessToken);
      mockHttpService.post.mockReturnValue(throwError(() => networkError));

      // Act & Assert
      await expect(service.callBitrixAPI(domain, method)).rejects.toThrow(
        'Network error - Cannot connect to Bitrix24 server',
      );
    });
  });

  describe('getContacts', () => {
    it('should call crm.contact.list with correct parameters', async () => {
      // Arrange
      const domain = 'test.bitrix24.com';
      const filters = { '%NAME': 'Test' };
      const expectedPayload = {
        select: ['ID', 'NAME', 'LAST_NAME', 'EMAIL', 'PHONE'],
        filter: filters,
        start: 0,
      };

      jest.spyOn(service, 'callBitrixAPI').mockResolvedValue({
        result: [{ ID: '1', NAME: 'Test Contact' }],
      });

      // Act
      await service.getContacts(domain, filters);

      // Assert
      expect(service.callBitrixAPI).toHaveBeenCalledWith(
        domain,
        'crm.contact.list',
        expectedPayload,
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should call user.current API', async () => {
      // Arrange
      const domain = 'test.bitrix24.com';

      jest.spyOn(service, 'callBitrixAPI').mockResolvedValue({
        result: { ID: '1', NAME: 'Test User' },
      });

      // Act
      await service.getCurrentUser(domain);

      // Assert
      expect(service.callBitrixAPI).toHaveBeenCalledWith(
        domain,
        'user.current',
      );
    });
  });
});
