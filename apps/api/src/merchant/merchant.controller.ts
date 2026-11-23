import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { BetterAuthGuard } from '../auth/auth.guard';
import { PayMerchantDto, RegisterMerchantDto } from './dto/merchant.dto';

@UseGuards(BetterAuthGuard)
@Controller('merchant')
export class MerchantController {
    constructor(private readonly merchantService: MerchantService) { }

    @Post('register')
    register(@Req() req: any, @Body() dto: RegisterMerchantDto) {
        return this.merchantService.registerMerchant(
            req.user.id,
            dto.businessName,
            dto.category,
        );
    }

    @Get('summary')
    getSummary(@Req() req: any) {
        return this.merchantService.getSummary(req.user.id);
    }

    @Post('pay')
    pay(@Req() req: any, @Body() dto: PayMerchantDto) {
        return this.merchantService.payMerchant(
            req.user.id,
            dto.merchantCode,
            dto.amount,
            dto.note,
        );
    }

    @Post('settle')
    settle(@Req() req: any) {
        return this.merchantService.settleToPersonalWallet(req.user.id);
    }
}