import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class RegisterMerchantDto {
    @IsString()
    @IsNotEmpty()
    businessName: string;

    @IsString()
    @IsNotEmpty()
    category: string;
}

export class PayMerchantDto {
    @IsString()
    @IsNotEmpty()
    merchantCode: string;

    @IsInt()
    @Min(100)
    amount: number;

    @IsString()
    @IsOptional()
    note?: string;
}