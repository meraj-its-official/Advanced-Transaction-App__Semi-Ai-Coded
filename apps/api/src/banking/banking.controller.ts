import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { BankingService } from './banking.service';
import { BetterAuthGuard } from '../auth/auth.guard';
import {
  BankWebhookDto,
  CreateBankAccountDto,
  CreateOnRampDto,
} from './dto/banking.dto';

@ApiTags('Banking')
@Controller('banking')
export class BankingController {
  constructor(private readonly bankingService: BankingService) { }

  @UseGuards(BetterAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Link a new bank account' })
  @Post('accounts')
  addBankAccount(@Req() req: any, @Body() dto: CreateBankAccountDto) {
    return this.bankingService.addBankAccount(req.user.id, dto);
  }

  @UseGuards(BetterAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all linked bank accounts of user' })
  @Get('accounts')
  getBankAccounts(@Req() req: any) {
    return this.bankingService.getBankAccounts(req.user.id);
  }

  @UseGuards(BetterAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate On-Ramp transaction' })
  @Post('onramp')
  initiateOnRamp(@Req() req: any, @Body() dto: CreateOnRampDto) {
    return this.bankingService.initiateOnRamp(
      req.user.id,
      dto.amount,
      dto.provider,
      dto.bankAccountId,
      dto.currency,
    );
  }

  @ApiOperation({ summary: 'Bank webhook to update transaction status' })
  @Post('webhook')
  webhook(@Body() dto: BankWebhookDto) {
    return this.bankingService.processBankWebhook(dto.token, dto.status);
  }

  @ApiOperation({ summary: 'Bank checkout page' })
  @ApiQuery({ name: 'token', required: true, type: String })
  @Get('checkout')
  async checkOut(@Query('token') token: string, @Res() res: Response) {
    const txn = await this.bankingService.getTxnByToken(token);
    if (!txn) return res.status(404).send('Invalid Payment Token');

    // Kyunki schema mein amount Decimal(18, 2) (Rupees) hai, isliye / 100 nahi karenge
    const rupees = Number(txn.amount).toFixed(2);
    return res.send(`
      <html>
        <body style="font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;background:#f1f5f9;">
          <div style="background:white;padding:32px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);text-align:center;max-width:360px;">
            <h2 style="color:#0f172a;">${txn.provider} NetBanking</h2>
            <p style="font-size:28px;font-weight:bold;margin:16px 0;">${txn.currency} ${rupees}</p>
            <form method="POST" action="/banking/mock-confirm">
              <input type="hidden" name="token" value="${token}" />
              <button name="status" value="Success" style="background:#16a34a;color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:bold;margin-right:8px;">Approve Payment</button>
              <button name="status" value="Failure" style="background:#dc2626;color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:bold;">Decline</button>
            </form>
          </div>
        </body>
      </html>
    `);
  }

  @ApiOperation({ summary: 'Bank payment confirmation' })
  @Post('confirm')
  async confirm(@Body() dto: BankWebhookDto, @Res() res: Response) {
    await this.bankingService.processBankWebhook(dto.token, dto.status);
    return res.redirect('http://localhost:3000/dashboard');
  }
}