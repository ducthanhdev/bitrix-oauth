import { Test, TestingModule } from '@nestjs/testing';
import { ContactService } from '../../modules/contact/contact.service';
import { BitrixApiService } from '../../modules/bitrix/bitrix-api.service';
import { CreateContactDto, UpdateContactDto } from '../../dto/contact.dto';

describe('ContactService', () => {
  let service: ContactService;
  let bitrixApiService: BitrixApiService;

  const mockBitrixApiService = {
    callBitrixAPI: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        {
          provide: BitrixApiService,
          useValue: mockBitrixApiService,
        },
      ],
    }).compile();

    service = module.get<ContactService>(ContactService);
    bitrixApiService = module.get<BitrixApiService>(BitrixApiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllContacts', () => {
    it('should return contacts with bank info', async () => {
      // Arrange
      const domain = 'test.bitrix24.com';
      const mockContacts = [
        {
          ID: '1',
          NAME: 'Test Contact',
          PHONE: [{ VALUE: '0123456789', VALUE_TYPE: 'WORK' }],
          EMAIL: [{ VALUE: 'test@example.com', VALUE_TYPE: 'WORK' }],
          ADDRESS: 'Phường 1, Quận 1, TP. Hồ Chí Minh',
          DATE_CREATE: '2024-01-01T00:00:00Z',
          DATE_MODIFY: '2024-01-01T00:00:00Z',
        },
      ];

      mockBitrixApiService.callBitrixAPI
        .mockResolvedValueOnce({ result: mockContacts }) // crm.contact.list
        .mockResolvedValueOnce({ result: [] }); // crm.requisite.list

      // Act
      const result = await service.getAllContacts(domain);

      // Assert
      expect(mockBitrixApiService.callBitrixAPI).toHaveBeenCalledWith(
        domain,
        'crm.contact.list',
        {
          select: ['ID', 'NAME', 'LAST_NAME', 'PHONE', 'EMAIL', 'WEB', 'ADDRESS', 'DATE_CREATE', 'DATE_MODIFY'],
          filter: {},
          start: 0,
        },
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: '1',
        name: 'Test Contact',
        phone: '0123456789',
        email: 'test@example.com',
        address: {
          ward: 'Phường 1',
          district: 'Quận 1',
          city: 'TP. Hồ Chí Minh',
        },
      });
    });

    it('should handle empty contacts list', async () => {
      // Arrange
      const domain = 'test.bitrix24.com';

      mockBitrixApiService.callBitrixAPI.mockResolvedValue({ result: [] });

      // Act
      const result = await service.getAllContacts(domain);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getContactById', () => {
    it('should return contact by ID', async () => {
      // Arrange
      const domain = 'test.bitrix24.com';
      const contactId = '123';
      const mockContact = {
        ID: '123',
        NAME: 'Test Contact',
        PHONE: [{ VALUE: '0123456789', VALUE_TYPE: 'WORK' }],
        EMAIL: [{ VALUE: 'test@example.com', VALUE_TYPE: 'WORK' }],
        DATE_CREATE: '2024-01-01T00:00:00Z',
        DATE_MODIFY: '2024-01-01T00:00:00Z',
      };

      mockBitrixApiService.callBitrixAPI
        .mockResolvedValueOnce({ result: mockContact }) // crm.contact.get
        .mockResolvedValueOnce({ result: [] }); // crm.requisite.list

      // Act
      const result = await service.getContactById(domain, contactId);

      // Assert
      expect(mockBitrixApiService.callBitrixAPI).toHaveBeenCalledWith(
        domain,
        'crm.contact.get',
        { id: contactId },
      );
      expect(result).toMatchObject({
        id: '123',
        name: 'Test Contact',
        phone: '0123456789',
        email: 'test@example.com',
      });
    });

    it('should throw NotFoundException when contact not found', async () => {
      // Arrange
      const domain = 'test.bitrix24.com';
      const contactId = '123';

      mockBitrixApiService.callBitrixAPI.mockResolvedValue({ result: null });

      // Act & Assert
      await expect(service.getContactById(domain, contactId)).rejects.toThrow(
        'Contact with ID 123 not found',
      );
    });
  });

  describe('createContact', () => {
    it('should create contact successfully', async () => {
      // Arrange
      const domain = 'test.bitrix24.com';
      const createContactDto: CreateContactDto = {
        name: 'New Contact',
        phone: '0123456789',
        email: 'new@example.com',
        address: {
          ward: 'Phường 1',
          district: 'Quận 1',
          city: 'TP. Hồ Chí Minh',
        },
        bankInfo: {
          bankName: 'Vietcombank',
          accountNumber: '1234567890',
        },
      };

      const mockCreatedContact = {
        ID: '456',
        NAME: 'New Contact',
        PHONE: [{ VALUE: '0123456789', VALUE_TYPE: 'WORK' }],
        EMAIL: [{ VALUE: 'new@example.com', VALUE_TYPE: 'WORK' }],
        ADDRESS: 'Phường 1, Quận 1, TP. Hồ Chí Minh',
        DATE_CREATE: '2024-01-01T00:00:00Z',
        DATE_MODIFY: '2024-01-01T00:00:00Z',
      };

      // Mock for createContact flow
      mockBitrixApiService.callBitrixAPI
        .mockResolvedValueOnce({ result: '456' }) // crm.contact.add
        .mockResolvedValueOnce({ result: '123' }) // crm.requisite.add (for bankInfo)
        .mockResolvedValueOnce({ result: mockCreatedContact }) // crm.contact.get (for getContactById)
        .mockResolvedValueOnce({ result: [] }); // crm.requisite.list (for getContactById)

      // Act
      const result = await service.createContact(domain, createContactDto);

      // Assert
      expect(mockBitrixApiService.callBitrixAPI).toHaveBeenCalledWith(
        domain,
        'crm.contact.add',
        {
          fields: {
            NAME: 'New Contact',
            PHONE: [{ VALUE: '0123456789', VALUE_TYPE: 'WORK' }],
            EMAIL: [{ VALUE: 'new@example.com', VALUE_TYPE: 'WORK' }],
            ADDRESS: 'Phường 1, Quận 1, TP. Hồ Chí Minh',
          },
        },
      );
      expect(result).toMatchObject({
        id: '456',
        name: 'New Contact',
        phone: '0123456789',
        email: 'new@example.com',
      });
    });
  });

  describe('updateContact', () => {
    it('should update contact successfully', async () => {
      // Arrange
      const domain = 'test.bitrix24.com';
      const contactId = '123';
      const updateContactDto: UpdateContactDto = {
        name: 'Updated Contact',
        phone: '0987654321',
      };

      const mockUpdatedContact = {
        ID: '123',
        NAME: 'Updated Contact',
        PHONE: [{ VALUE: '0987654321', VALUE_TYPE: 'WORK' }],
        DATE_CREATE: '2024-01-01T00:00:00Z',
        DATE_MODIFY: '2024-01-01T00:00:00Z',
      };

      // Mock for updateContact flow
      mockBitrixApiService.callBitrixAPI
        .mockResolvedValueOnce({ result: mockUpdatedContact }) // crm.contact.get (check exists)
        .mockResolvedValueOnce({ result: '123' }) // crm.contact.update
        .mockResolvedValueOnce({ result: '456' }) // crm.requisite.update (for bankInfo)
        .mockResolvedValueOnce({ result: mockUpdatedContact }) // crm.contact.get (return updated)
        .mockResolvedValueOnce({ result: [] }); // crm.requisite.list (for getContactById)

      // Act
      const result = await service.updateContact(domain, contactId, updateContactDto);

      // Assert
      expect(mockBitrixApiService.callBitrixAPI).toHaveBeenCalledWith(
        domain,
        'crm.contact.update',
        {
          id: contactId,
          fields: {
            NAME: 'Updated Contact',
            PHONE: [{ VALUE: '0987654321', VALUE_TYPE: 'WORK' }],
          },
        },
      );
      expect(result).toMatchObject({
        id: '123',
        name: 'Updated Contact',
        phone: '0987654321',
      });
    });
  });

  describe('deleteContact', () => {
    it('should delete contact successfully', async () => {
      // Arrange
      const domain = 'test.bitrix24.com';
      const contactId = '123';

      const mockContact = {
        ID: '123',
        NAME: 'Test Contact',
        DATE_CREATE: '2024-01-01T00:00:00Z',
        DATE_MODIFY: '2024-01-01T00:00:00Z',
      };

      mockBitrixApiService.callBitrixAPI
        .mockResolvedValueOnce({ result: mockContact }) // crm.contact.get (check exists)
        .mockResolvedValueOnce({ result: [] }) // crm.requisite.list
        .mockResolvedValueOnce({ result: '123' }); // crm.contact.delete

      // Act
      const result = await service.deleteContact(domain, contactId);

      // Assert
      expect(mockBitrixApiService.callBitrixAPI).toHaveBeenCalledWith(
        domain,
        'crm.contact.delete',
        { id: contactId },
      );
      expect(result).toEqual({
        message: 'Contact 123 deleted successfully',
      });
    });
  });
});
