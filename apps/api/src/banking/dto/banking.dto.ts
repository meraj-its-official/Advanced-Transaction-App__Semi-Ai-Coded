import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsIn,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Length,
    Min,
} from 'class-validator';

export class CreateBankAccountDto {
    @ApiProperty({ example: '123456789012', description: 'Bank account number' })
    @IsString()
    @IsNotEmpty()
    accountNumber: string;

    @ApiProperty({ example: 'HDFC0001234', description: '11-character IFSC Code' })
    @IsString()
    @Length(11, 11)
    ifscCode: string;

    @ApiProperty({ example: 'HDFC Bank', description: 'Bank name' })
    @IsString()
    @IsNotEmpty()
    bankName: string;

    @ApiProperty({ example: 'MD Meraj Alam', description: 'Account holder name (Required by schema)' })
    @IsString()
    @IsNotEmpty()
    holderName: string;

    @ApiPropertyOptional({ default: false })
    @IsBoolean()
    @IsOptional()
    isPrimary?: boolean;
}

export class CreateOnRampDto {
    @ApiProperty({ example: 500, description: 'Amount in INR (Rupees) matching Decimal(18,2)' })
    @IsNumber()
    @Min(1) // Minimum ₹1
    amount: number;

    @ApiProperty({ example: 'HDFC Bank', description: 'Bank / Payment Provider name' })
    @IsString()
    @IsNotEmpty()
    provider: string;

    @ApiPropertyOptional({ description: 'Optional linked BankAccount ID' })
    @IsString()
    @IsOptional()
    bankAccountId?: string;

    @ApiPropertyOptional({ example: 'INR', default: 'INR' })
    @IsString()
    @IsOptional()
    currency?: string;
}

export class BankWebhookDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    token: string;

    @ApiProperty({ enum: ['Success', 'Failure'] })
    @IsString()
    @IsIn(['Success', 'Failure'])
    status: 'Success' | 'Failure';
}