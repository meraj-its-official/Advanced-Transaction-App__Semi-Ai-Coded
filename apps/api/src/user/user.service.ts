import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@repo/db';
import { UpdateProfileDto } from './dto/user.dto';

@Injectable()
export class UserService {
    async getMe(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                createdAt: true,
                balance: { select: { amount: true, locked: true } },
                merchant: {
                    select: {
                        id: true,
                        businessName: true,
                        merchantCode: true,
                        category: true,
                        balance: true,
                    },
                },
            },
        });

        if (!user) throw new NotFoundException('User not found');

        return {
            profile: {
                id: user.id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                createdAt: user.createdAt,
            },
            roles: {
                isCustomer: true,
                isMerchant: Boolean(user.merchant),
            },
            wallet: user.balance || { amount: 0, locked: 0 },
            merchantAccount: user.merchant || null,
        };
    }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        return prisma.user.update({
            where: { id: userId },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.phoneNumber && { phoneNumber: dto.phoneNumber }),
            },
            select: { id: true, name: true, email: true, phoneNumber: true },
        });
    }

    async getActivity(userId: string) {
        const [onRamp, p2pSent, p2pReceived, merchantPaid] = await Promise.all([
            prisma.onRampTransaction.findMany({
                where: { userId },
                orderBy: { startTime: 'desc' },
                take: 10,
            }),
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
            prisma.merchantTransaction.findMany({
                where: { fromUserId: userId },
                include: { merchant: { select: { businessName: true, merchantCode: true } } },
                orderBy: { timestamp: 'desc' },
                take: 10,
            }),
        ]);

        return { onRamp, p2pSent, p2pReceived, merchantPaid };
    }
}