import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { BetterAuthGuard } from '../auth/auth.guard';
import { P2PTransferDto } from './dto/wallet.dto';

@UseGuards(BetterAuthGuard)
@Controller('wallet')
export class WalletController {
    constructor(private readonly walletService: WalletService) { }

    @Get('summary')
    getSummary(@Req() req: any) {
        return this.walletService.getSummary(req.user.id);
    }

    @Post('transfer')
    transfer(@Req() req: any, @Body() dto: P2PTransferDto) {
        return this.walletService.transferP2P(
            req.user.id,
            dto.toIdentifier,
            dto.amount,
        );
    }
}