import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { prisma } from '@repo/db';
import type { TransactionClient } from '@repo/db';
import { randomInt } from 'crypto';

@Injectable()
export class MerchantService {
    async registerMerchant(userId: string, businessName: string, category: string) {
        const existing = await prisma.merchant.findUnique({ where: { userId } });
        if (existing) throw new ConflictException('Merchant already registered');

        const merchantCode = `PAYTM_MCH_${randomInt(10000, 99999)}`;

        return prisma.merchant.create({
            data: { userId, businessName, category, merchantCode },
        });
    }

    async getSummary(userId: string) {
        const merchant = await prisma.merchant.findUnique({
            where: { userId },
            include: {
                transactions: {
                    include: { fromUser: { select: { name: true, email: true } } },
                    orderBy: { timestamp: 'desc' },
                    take: 20,
                },
            },
        });

        if (!merchant) return { isMerchant: false, merchant: null };
        return { isMerchant: true, merchant };
    }

    async payMerchant(
        fromUserId: string,
        merchantCode: string,
        amount: number,
        note?: string,
    ) {
        const merchant = await prisma.merchant.findUnique({
            where: { merchantCode },
        });

        if (!merchant) throw new NotFoundException('Invalid Merchant Code');
        if (merchant.userId === fromUserId) {
            throw new BadRequestException('Cannot pay to your own business');
        }

        return prisma.$transaction(async (tx: TransactionClient) => {
            await tx.$queryRaw`SELECT * FROM "balance" WHERE "userId" = ${fromUserId} FOR UPDATE`;

            const customerBalance = await tx.balance.findUnique({
                where: { userId: fromUserId },
            });

            if (!customerBalance || customerBalance.amount < amount) {
                throw new BadRequestException('Insufficient wallet balance');
            }

            await tx.balance.update({
                where: { userId: fromUserId },
                data: { amount: { decrement: amount } },
            });

            await tx.merchant.update({
                where: { id: merchant.id },
                data: { balance: { increment: amount } },
            });

            const txn = await tx.merchantTransaction.create({
                data: { fromUserId, merchantId: merchant.id, amount, note },
            });

            return {
                message: `Paid ₹${(amount / 100).toFixed(2)} to ${merchant.businessName}`,
                transactionId: txn.id,
            };
        });
    }

    async settleToPersonalWallet(userId: string) {
        return prisma.$transaction(async (tx: TransactionClient) => {
            await tx.$queryRaw`SELECT * FROM "merchant" WHERE "userId" = ${userId} FOR UPDATE`;

            const merchant = await tx.merchant.findUnique({ where: { userId } });
            if (!merchant || merchant.balance <= 0) {
                throw new BadRequestException('No balance available to settle');
            }

            const amount = merchant.balance;

            await tx.merchant.update({
                where: { userId },
                data: { balance: 0 },
            });

            await tx.balance.upsert({
                where: { userId },
                update: { amount: { increment: amount } },
                create: { userId, amount, locked: 0 },
            });

            return {
                message: `Settled ₹${(amount / 100).toFixed(2)} to personal wallet`,
                settledAmount: amount,
            };
        });
    }
}
