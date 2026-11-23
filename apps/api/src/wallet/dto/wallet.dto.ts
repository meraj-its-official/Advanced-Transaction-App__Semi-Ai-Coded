import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class P2PTransferDto {
    @IsString()
    @IsNotEmpty()
    toIdentifier: string; // Receiver email or phoneNumber

    @IsInt()
    @Min(100) // Minimum ₹1 (100 paise)
    amount: number;
}