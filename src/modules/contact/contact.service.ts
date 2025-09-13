import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { BitrixApiService } from '../bitrix/bitrix-api.service';
import { CreateContactDto, UpdateContactDto, ContactResponseDto, AddressDto, BankInfoDto } from '../../dto/contact.dto';

/**
 * Contact Service - Xử lý logic quản lý Contact với Bitrix24
 * 
 * Chức năng chính:
 * - CRUD operations cho Contact (Create, Read, Update, Delete)
 * - Quản lý thông tin ngân hàng (Bank Info) với crm.requisite
 * - Validation và mapping dữ liệu
 * - Xử lý lỗi và logging chi tiết
 */
@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(private readonly bitrixApiService: BitrixApiService) {}

  /**
   * Lấy danh sách tất cả contacts
   * 
   * @param domain - Domain Bitrix24
   * @param filters - Bộ lọc tìm kiếm
   * @returns Danh sách contacts với thông tin ngân hàng
   */
  async getAllContacts(domain: string, filters: any = {}): Promise<ContactResponseDto[]> {
    try {
      this.logger.log(`Getting all contacts for domain: ${domain}`);

      const response = await this.bitrixApiService.callBitrixAPI(domain, 'crm.contact.list', {
        select: ['ID', 'NAME', 'LAST_NAME', 'PHONE', 'EMAIL', 'WEB', 'ADDRESS', 'DATE_CREATE', 'DATE_MODIFY'],
        filter: filters,
        start: 0,
      });

      const contacts = response.result || [];
      
      const contactsWithBankInfo = await Promise.all(
        contacts.map(async (contact: any) => {
          const bankInfo = await this.getContactBankInfo(domain, contact.ID);
          return this.mapBitrixContactToDto(contact, bankInfo);
        })
      );

      return contactsWithBankInfo;
    } catch (error) {
      this.logger.error('Failed to get contacts:', error.message);
      throw error;
    }
  }

  /**
   * Lấy thông tin một contact theo ID
   * 
   * @param domain - Domain Bitrix24
   * @param id - ID của contact
   * @returns Thông tin contact chi tiết
   */
  async getContactById(domain: string, id: string): Promise<ContactResponseDto> {
    try {
      this.logger.log(`Getting contact by ID: ${id} for domain: ${domain}`);

      const response = await this.bitrixApiService.callBitrixAPI(domain, 'crm.contact.get', {
        id: id,
      });

      if (!response.result) {
        throw new NotFoundException(`Contact with ID ${id} not found`);
      }

      const bankInfo = await this.getContactBankInfo(domain, id);
      return this.mapBitrixContactToDto(response.result, bankInfo);
    } catch (error) {
      this.logger.error(`Failed to get contact ${id}:`, error.message);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to get contact: ${error.message}`);
    }
  }

  /**
   * Tạo contact mới
   * 
   * @param domain - Domain Bitrix24
   * @param createContactDto - Dữ liệu contact mới
   * @returns Thông tin contact đã tạo
   */
  async createContact(domain: string, createContactDto: CreateContactDto): Promise<ContactResponseDto> {
    try {
      this.logger.log(`Creating new contact for domain: ${domain}`);

      const contactData = this.prepareContactDataForBitrix(createContactDto);

      const response = await this.bitrixApiService.callBitrixAPI(domain, 'crm.contact.add', {
        fields: contactData,
      });

      const contactId = response.result;

      if (createContactDto.bankInfo) {
        await this.createContactBankInfo(domain, contactId, createContactDto.bankInfo);
      }

      return await this.getContactById(domain, contactId);
    } catch (error) {
      this.logger.error('Failed to create contact:', error.message);
      throw new BadRequestException(`Failed to create contact: ${error.message}`);
    }
  }

  /**
   * Cập nhật contact
   * 
   * @param domain - Domain Bitrix24
   * @param id - ID của contact
   * @param updateContactDto - Dữ liệu cập nhật
   * @returns Thông tin contact đã cập nhật
   */
  async updateContact(domain: string, id: string, updateContactDto: UpdateContactDto): Promise<ContactResponseDto> {
    try {
      this.logger.log(`Updating contact ${id} for domain: ${domain}`);

      await this.getContactById(domain, id);

      const updateData = this.prepareContactDataForBitrix(updateContactDto);

      await this.bitrixApiService.callBitrixAPI(domain, 'crm.contact.update', {
        id: id,
        fields: updateData,
      });

      if (updateContactDto.bankInfo) {
        await this.updateContactBankInfo(domain, id, updateContactDto.bankInfo);
      }

      return await this.getContactById(domain, id);
    } catch (error) {
      this.logger.error(`Failed to update contact ${id}:`, error.message);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update contact: ${error.message}`);
    }
  }

  /**
   * Xóa contact
   * 
   * @param domain - Domain Bitrix24
   * @param id - ID của contact
   * @returns Thông báo xóa thành công
   */
  async deleteContact(domain: string, id: string): Promise<{ message: string }> {
    try {
      this.logger.log(`Deleting contact ${id} for domain: ${domain}`);

      await this.getContactById(domain, id);

      await this.deleteContactBankInfo(domain, id);

      await this.bitrixApiService.callBitrixAPI(domain, 'crm.contact.delete', {
        id: id,
      });

      return { message: `Contact ${id} deleted successfully` };
    } catch (error) {
      this.logger.error(`Failed to delete contact ${id}:`, error.message);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete contact: ${error.message}`);
    }
  }

  /**
   * Lấy thông tin ngân hàng của contact
   * 
   * @param domain - Domain Bitrix24
   * @param contactId - ID của contact
   * @returns Thông tin ngân hàng hoặc null
   */
  private async getContactBankInfo(domain: string, contactId: string): Promise<BankInfoDto | null> {
    try {
      const response = await this.bitrixApiService.callBitrixAPI(domain, 'crm.requisite.list', {
        filter: { ENTITY_ID: contactId, ENTITY_TYPE_ID: 4 }, // 4 = Contact
        select: ['ID', 'RQ_BANK_NAME', 'RQ_ACC_NUM'],
      });

      const requisites = response.result || [];
      if (requisites.length === 0) {
        return null;
      }

      const requisite = requisites[0];
      return {
        bankName: requisite.RQ_BANK_NAME || '',
        accountNumber: requisite.RQ_ACC_NUM || '',
      };
    } catch (error) {
      this.logger.warn(`Failed to get bank info for contact ${contactId}:`, error.message);
      return null;
    }
  }

  /**
   * Tạo thông tin ngân hàng cho contact
   * 
   * @param domain - Domain Bitrix24
   * @param contactId - ID của contact
   * @param bankInfo - Thông tin ngân hàng
   */
  private async createContactBankInfo(domain: string, contactId: string, bankInfo: BankInfoDto): Promise<void> {
    try {
      await this.bitrixApiService.callBitrixAPI(domain, 'crm.requisite.add', {
        fields: {
          ENTITY_ID: contactId,
          ENTITY_TYPE_ID: 4, // 4 = Contact
          RQ_BANK_NAME: bankInfo.bankName,
          RQ_ACC_NUM: bankInfo.accountNumber,
        },
      });
    } catch (error) {
      this.logger.warn(`Failed to create bank info for contact ${contactId}:`, error.message);
    }
  }

  /**
   * Cập nhật thông tin ngân hàng cho contact
   * 
   * @param domain - Domain Bitrix24
   * @param contactId - ID của contact
   * @param bankInfo - Thông tin ngân hàng mới
   */
  private async updateContactBankInfo(domain: string, contactId: string, bankInfo: BankInfoDto): Promise<void> {
    try {
      const response = await this.bitrixApiService.callBitrixAPI(domain, 'crm.requisite.list', {
        filter: { ENTITY_ID: contactId, ENTITY_TYPE_ID: 4 },
        select: ['ID'],
      });

      const requisites = response.result || [];
      if (requisites.length > 0) {
        await this.bitrixApiService.callBitrixAPI(domain, 'crm.requisite.update', {
          id: requisites[0].ID,
          fields: {
            RQ_BANK_NAME: bankInfo.bankName,
            RQ_ACC_NUM: bankInfo.accountNumber,
          },
        });
      } else {
        await this.createContactBankInfo(domain, contactId, bankInfo);
      }
    } catch (error) {
      this.logger.warn(`Failed to update bank info for contact ${contactId}:`, error.message);
    }
  }

  /**
   * Xóa thông tin ngân hàng của contact
   * 
   * @param domain - Domain Bitrix24
   * @param contactId - ID của contact
   */
  private async deleteContactBankInfo(domain: string, contactId: string): Promise<void> {
    try {
      const response = await this.bitrixApiService.callBitrixAPI(domain, 'crm.requisite.list', {
        filter: { ENTITY_ID: contactId, ENTITY_TYPE_ID: 4 },
        select: ['ID'],
      });

      const requisites = response.result || [];
      for (const requisite of requisites) {
        await this.bitrixApiService.callBitrixAPI(domain, 'crm.requisite.delete', {
          id: requisite.ID,
        });
      }
    } catch (error) {
      this.logger.warn(`Failed to delete bank info for contact ${contactId}:`, error.message);
    }
  }

  /**
   * Chuẩn bị dữ liệu contact cho Bitrix24
   * 
   * @param contactDto - DTO contact
   * @returns Dữ liệu đã format cho Bitrix24
   */
  private prepareContactDataForBitrix(contactDto: CreateContactDto | UpdateContactDto): any {
    const data: any = {};

    if (contactDto.name) {
      data.NAME = contactDto.name;
    }

    if (contactDto.phone) {
      data.PHONE = [{ VALUE: contactDto.phone, VALUE_TYPE: 'WORK' }];
    }

    if (contactDto.email) {
      data.EMAIL = [{ VALUE: contactDto.email, VALUE_TYPE: 'WORK' }];
    }

    if (contactDto.website) {
      data.WEB = [{ VALUE: contactDto.website, VALUE_TYPE: 'WORK' }];
    }

    if (contactDto.address) {
      data.ADDRESS = `${contactDto.address.ward}, ${contactDto.address.district}, ${contactDto.address.city}`;
    }

    return data;
  }

  /**
   * Chuyển đổi dữ liệu từ Bitrix24 sang DTO
   * 
   * @param contact - Dữ liệu contact từ Bitrix24
   * @param bankInfo - Thông tin ngân hàng
   * @returns ContactResponseDto
   */
  private mapBitrixContactToDto(contact: any, bankInfo: BankInfoDto | null): ContactResponseDto {
    const phone = contact.PHONE && contact.PHONE.length > 0 ? contact.PHONE[0].VALUE : undefined;
    const email = contact.EMAIL && contact.EMAIL.length > 0 ? contact.EMAIL[0].VALUE : undefined;
    const website = contact.WEB && contact.WEB.length > 0 ? contact.WEB[0].VALUE : undefined;

    let address: AddressDto | undefined;
    if (contact.ADDRESS) {
      const addressParts = contact.ADDRESS.split(', ');
      if (addressParts.length >= 3) {
        address = {
          ward: addressParts[0],
          district: addressParts[1],
          city: addressParts[2],
        };
      }
    }

    return {
      id: contact.ID,
      name: contact.NAME || '',
      address,
      phone,
      email,
      website,
      bankInfo: bankInfo || undefined,
      createdAt: contact.DATE_CREATE,
      updatedAt: contact.DATE_MODIFY,
    };
  }
}
