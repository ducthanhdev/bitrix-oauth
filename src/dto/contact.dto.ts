import { IsString, IsEmail, IsOptional, IsNotEmpty, IsPhoneNumber, IsUrl, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddressDto {
  @ApiProperty({ description: 'Phường/Xã', example: 'Phường 1' })
  @IsString()
  @IsNotEmpty()
  ward: string;

  @ApiProperty({ description: 'Quận/Huyện', example: 'Quận 1' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({ description: 'Tỉnh/Thành phố', example: 'TP. Hồ Chí Minh' })
  @IsString()
  @IsNotEmpty()
  city: string;
}

export class BankInfoDto {
  @ApiProperty({ description: 'Tên ngân hàng', example: 'Vietcombank' })
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty({ description: 'Số tài khoản', example: '1234567890' })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;
}

export class CreateContactDto {
  @ApiProperty({ description: 'Tên contact (bắt buộc)', example: 'Nguyễn Văn A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Địa chỉ', type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  @IsObject()
  @IsOptional()
  address?: AddressDto;

  @ApiPropertyOptional({ description: 'Số điện thoại', example: '0123456789' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Email', example: 'contact@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Website', example: 'https://example.com' })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ description: 'Thông tin ngân hàng', type: BankInfoDto })
  @ValidateNested()
  @Type(() => BankInfoDto)
  @IsObject()
  @IsOptional()
  bankInfo?: BankInfoDto;
}

export class UpdateContactDto {
  @ApiPropertyOptional({ description: 'Tên contact', example: 'Nguyễn Văn B' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ', type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  @IsObject()
  @IsOptional()
  address?: AddressDto;

  @ApiPropertyOptional({ description: 'Số điện thoại', example: '0987654321' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Email', example: 'newemail@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Website', example: 'https://newsite.com' })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ description: 'Thông tin ngân hàng', type: BankInfoDto })
  @ValidateNested()
  @Type(() => BankInfoDto)
  @IsObject()
  @IsOptional()
  bankInfo?: BankInfoDto;
}

export class ContactResponseDto {
  @ApiProperty({ description: 'ID của contact trong Bitrix24' })
  id: string;

  @ApiProperty({ description: 'Tên contact' })
  name: string;

  @ApiPropertyOptional({ description: 'Địa chỉ' })
  address?: AddressDto;

  @ApiPropertyOptional({ description: 'Số điện thoại' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Email' })
  email?: string;

  @ApiPropertyOptional({ description: 'Website' })
  website?: string;

  @ApiPropertyOptional({ description: 'Thông tin ngân hàng' })
  bankInfo?: BankInfoDto;

  @ApiProperty({ description: 'Ngày tạo' })
  createdAt: string;

  @ApiProperty({ description: 'Ngày cập nhật' })
  updatedAt: string;
}
