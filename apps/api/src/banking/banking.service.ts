import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { prisma, type TransactionClient } from '@repo/db';
import { randomUUID } from 'crypto';
import { CreateBankAccountDto } from './dto/banking.dto';

@Injectable()
export class BankingService {
    // 1. Link / Upsert a user's bank account
    async addBankAccount(userId: string, dto: CreateBankAccountDto) {
        // Agar naya account primary set ho raha hai, toh baaki accounts ko non-primary karein
        if (dto.isPrimary) {
            await prisma.bankAccount.updateMany({
                where: { userId },
                data: { isPrimary: false },
            });
        }

        return prisma.bankAccount.upsert({
            where: {
                userId_accountNumber: {
                    userId,
                    accountNumber: dto.accountNumber,
                },
            },
            update: {
                ifscCode: dto.ifscCode.toUpperCase(),
                bankName: dto.bankName,
                holderName: dto.holderName,
                ...(dto.isPrimary !== undefined && { isPrimary: dto.isPrimary }),
            },
            create: {
                userId,
                accountNumber: dto.accountNumber,
                ifscCode: dto.ifscCode.toUpperCase(),
                bankName: dto.bankName,
                holderName: dto.holderName,
                isPrimary: dto.isPrimary ?? false,
            },
        });
    }

    // 2. Get all linked bank accounts of user
    async getBankAccounts(userId: string) {
        return prisma.bankAccount.findMany({
            where: { userId },
            orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
        });
    }

    // 3. Initiate On-Ramp transaction (matches controller arguments)
    async initiateOnRamp(
        userId: string,
        amount: number,
        provider: string,
        bankAccountId?: string,
        currency: string = 'INR',
    ) {
        // Agar bankAccountId bheja gaya hai toh verify karein ki woh isi user ka hai
        if (bankAccountId) {
            const account = await prisma.bankAccount.findFirst({
                where: { id: bankAccountId, userId },
            });
            if (!account) {
                throw new NotFoundException('Linked bank account not found');
            }
        }

        const token = `tok_${randomUUID()}`;

        const txn = await prisma.onRampTransaction.create({
            data: {
                userId,
                amount, // Decimal(18, 2) in Rupees
                provider,
                bankAccountId: bankAccountId || null,
                currency,
                token,
                status: 'Processing',
            },
        });

        return {
            transactionId: txn.id,
            token: txn.token,
            checkoutUrl: `http://localhost:3001/banking/mock-checkout?token=${txn.token}`,
        };
    }

    // 4. Process Bank Webhook & Atomically Credit Wallet
    async processBankWebhook(token: string, status: 'Success' | 'Failure') {
        return prisma.$transaction(async (tx: TransactionClient) => {
            const txn = await tx.onRampTransaction.findUnique({ where: { token } });

            if (!txn) throw new NotFoundException('Invalid bank token');
            if (txn.status !== 'Processing') {
                throw new BadRequestException(
                    `Transaction already marked as ${txn.status}`,
                );
            }

            if (status === 'Failure') {
                await tx.onRampTransaction.update({
                    where: { token },
                    data: { status: 'Failure' },
                });
                return { message: 'Transaction failed' };
            }

            await tx.onRampTransaction.update({
                where: { token },
                data: { status: 'Success' },
            });

            // Note: Agar aapka Balance model 'Int' (paise) mein hai toh Math.round(Number(txn.amount) * 100) use karein.
            // Agar Balance model bhi 'Decimal(18, 2)' (Rupees) mein hai toh seedha txn.amount pass karein.
            const creditAmount = Math.round(Number(txn.amount) * 100);

            await tx.balance.upsert({
                where: { userId: txn.userId },
                update: { amount: { increment: creditAmount } },
                create: { userId: txn.userId, amount: creditAmount, locked: 0 },
            });

            return {
                message: `Added ${txn.currency} ${Number(txn.amount).toFixed(2)} to wallet`,
                amount: txn.amount,
            };
        });
    }

    // 5. Fetch Transaction by Token (for Mock Bank Checkout)
    async getTxnByToken(token: string) {
        return prisma.onRampTransaction.findUnique({ where: { token } });
    }
}