import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { prisma } from '@repo/db';
import type { TransactionClient } from '@repo/db';

@Injectable()
export class WalletService {
    async getSummary(userId: string) {
        const [balance, sent, received] = await Promise.all([
            prisma.balance.findUnique({ where: { userId } }),
            prisma.p2PTransfer.findMany({
                where: { fromUserId: userId },
                include: { toUser: { select: { name: true, email: true } } },
                orderBy: { timestamp: 'desc' },
                take: 10,
            }),
            prisma.p2PTransfer.findMany({
                where: { toUserId: userId },
                include: { fromUser: { select: { name: true, email: true } } },
                orderBy: { timestamp: 'desc' },
                take: 10,
            }),
        ]);

        return {
            balance: balance || { amount: 0, locked: 0 },
            sent,
            received,
        };
    }

    async transferP2P(fromUserId: string, toIdentifier: string, amount: number) {
        const receiver = await prisma.user.findFirst({
            where: {
                OR: [{ email: toIdentifier }, { phoneNumber: toIdentifier }],
            },
        });

        if (!receiver) throw new NotFoundException('Recipient user not found');
        if (receiver.id === fromUserId) {
            throw new BadRequestException('Cannot transfer money to yourself');
        }

        return prisma.$transaction(async (tx: TransactionClient) => {
            // Deadlock-free deterministic row locking
            const [firstId, secondId] = [fromUserId, receiver.id].sort();
            await tx.$queryRaw`SELECT * FROM "balance" WHERE "userId" = ${firstId} FOR UPDATE`;
            await tx.$queryRaw`SELECT * FROM "balance" WHERE "userId" = ${secondId} FOR UPDATE`;

            const senderBalance = await tx.balance.findUnique({
                where: { userId: fromUserId },
            });

            if (!senderBalance || senderBalance.amount < amount) {
                throw new BadRequestException('Insufficient wallet balance');
            }

            await tx.balance.update({
                where: { userId: fromUserId },
                data: { amount: { decrement: amount } },
            });

            await tx.balance.upsert({
                where: { userId: receiver.id },
                update: { amount: { increment: amount } },
                create: { userId: receiver.id, amount, locked: 0 },
            });

            const transfer = await tx.p2PTransfer.create({
                data: { fromUserId, toUserId: receiver.id, amount },
            });

            return {
                message: `Transferred ₹${(amount / 100).toFixed(2)} to ${receiver.name}`,
                transferId: transfer.id,
            };
        });
    }
}
