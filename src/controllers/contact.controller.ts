import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Body, 
  Query, 
  Logger, 
  BadRequestException,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiBearerAuth,
  ApiBody
} from '@nestjs/swagger';
import { ContactService } from '../services/contact.service';
import { CreateContactDto, UpdateContactDto, ContactResponseDto } from '../dto/contact.dto';
import { ApiKeyGuard } from '../guards/api-key.guard';

@ApiTags('Contacts')
@Controller('contacts')
@UseGuards(ApiKeyGuard)
@ApiBearerAuth()
export class ContactController {
  private readonly logger = new Logger(ContactController.name);

  constructor(private readonly contactService: ContactService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả contacts' })
  @ApiQuery({ name: 'domain', description: 'Domain Bitrix24', example: 'your-domain.bitrix24.com' })
  @ApiQuery({ name: 'name', description: 'Tìm kiếm theo tên', required: false })
  @ApiQuery({ name: 'email', description: 'Tìm kiếm theo email', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách contacts được trả về thành công',
    type: [ContactResponseDto]
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getAllContacts(
    @Query('domain') domain: string,
    @Query('name') name?: string,
    @Query('email') email?: string,
  ): Promise<ContactResponseDto[]> {
    if (!domain) {
      throw new BadRequestException('Domain parameter is required');
    }

    try {
      this.logger.log(`Getting all contacts for domain: ${domain}`);

      const filters: any = {};
      if (name) {
        filters['%NAME'] = name;
      }
      if (email) {
        filters['%EMAIL'] = email;
      }

      return await this.contactService.getAllContacts(domain, filters);
    } catch (error) {
      this.logger.error('Failed to get contacts:', error.message);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin contact theo ID' })
  @ApiParam({ name: 'id', description: 'ID của contact trong Bitrix24' })
  @ApiQuery({ name: 'domain', description: 'Domain Bitrix24', example: 'your-domain.bitrix24.com' })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin contact được trả về thành công',
    type: ContactResponseDto
  })
  @ApiResponse({ status: 404, description: 'Contact không tồn tại' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getContactById(
    @Param('id') id: string,
    @Query('domain') domain: string,
  ): Promise<ContactResponseDto> {
    if (!domain) {
      throw new BadRequestException('Domain parameter is required');
    }

    try {
      this.logger.log(`Getting contact ${id} for domain: ${domain}`);
      return await this.contactService.getContactById(domain, id);
    } catch (error) {
      this.logger.error(`Failed to get contact ${id}:`, error.message);
      throw error;
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo contact mới' })
  @ApiQuery({ name: 'domain', description: 'Domain Bitrix24', example: 'your-domain.bitrix24.com' })
  @ApiBody({ type: CreateContactDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Contact được tạo thành công',
    type: ContactResponseDto
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async createContact(
    @Body() createContactDto: CreateContactDto,
    @Query('domain') domain: string,
  ): Promise<ContactResponseDto> {
    if (!domain) {
      throw new BadRequestException('Domain parameter is required');
    }

    try {
      this.logger.log(`Creating new contact for domain: ${domain}`);
      return await this.contactService.createContact(domain, createContactDto);
    } catch (error) {
      this.logger.error('Failed to create contact:', error.message);
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin contact' })
  @ApiParam({ name: 'id', description: 'ID của contact trong Bitrix24' })
  @ApiQuery({ name: 'domain', description: 'Domain Bitrix24', example: 'your-domain.bitrix24.com' })
  @ApiBody({ type: UpdateContactDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Contact được cập nhật thành công',
    type: ContactResponseDto
  })
  @ApiResponse({ status: 404, description: 'Contact không tồn tại' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async updateContact(
    @Param('id') id: string,
    @Body() updateContactDto: UpdateContactDto,
    @Query('domain') domain: string,
  ): Promise<ContactResponseDto> {
    if (!domain) {
      throw new BadRequestException('Domain parameter is required');
    }

    try {
      this.logger.log(`Updating contact ${id} for domain: ${domain}`);
      return await this.contactService.updateContact(domain, id, updateContactDto);
    } catch (error) {
      this.logger.error(`Failed to update contact ${id}:`, error.message);
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa contact' })
  @ApiParam({ name: 'id', description: 'ID của contact trong Bitrix24' })
  @ApiQuery({ name: 'domain', description: 'Domain Bitrix24', example: 'your-domain.bitrix24.com' })
  @ApiResponse({ 
    status: 200, 
    description: 'Contact được xóa thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Contact 123 deleted successfully' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Contact không tồn tại' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async deleteContact(
    @Param('id') id: string,
    @Query('domain') domain: string,
  ): Promise<{ message: string }> {
    if (!domain) {
      throw new BadRequestException('Domain parameter is required');
    }

    try {
      this.logger.log(`Deleting contact ${id} for domain: ${domain}`);
      return await this.contactService.deleteContact(domain, id);
    } catch (error) {
      this.logger.error(`Failed to delete contact ${id}:`, error.message);
      throw error;
    }
  }
}
