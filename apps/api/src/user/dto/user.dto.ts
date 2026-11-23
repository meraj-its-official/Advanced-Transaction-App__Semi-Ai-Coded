import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateProfileDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    @Matches(/^[6-9]\d{9}$/, { message: 'Enter valid 10-digit Indian mobile number' })
    phoneNumber?: string;
}