import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import {
  ArcjetModule,
  ArcjetGuard,
  shield,
  detectBot,
  tokenBucket,
} from '@arcjet/nest';
import { UserModule } from './user/user.module';
import { WalletModule } from './wallet/wallet.module';
import { BankingModule } from './banking/banking.module';
import { MerchantModule } from './merchant/merchant.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ArcjetModule.forRoot({
      isGlobal: true,
      key: process.env.ARCJET_KEY!,
      rules: [
        shield({ mode: 'LIVE' }),
        detectBot({ mode: 'DRY_RUN', allow: ['CATEGORY:SEARCH_ENGINE'] }),
        tokenBucket({ mode: 'LIVE', refillRate: 10, interval: 10, capacity: 20 }),
      ],
    }),
    UserModule,
    WalletModule,
    BankingModule,
    MerchantModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ArcjetGuard,
    },
  ],
})
export class AppModule { }