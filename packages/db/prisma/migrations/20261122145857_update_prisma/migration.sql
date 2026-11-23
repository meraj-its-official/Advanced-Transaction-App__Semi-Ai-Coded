-- AlterTable
ALTER TABLE "balance" ALTER COLUMN "amount" SET DEFAULT 0.0,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "locked" SET DEFAULT 0.0,
ALTER COLUMN "locked" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "merchant_transaction" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'INR',
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "on_ramp_transaction" ADD COLUMN     "bankAccountId" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'INR',
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "p2p_transfer" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(18,2);

-- CreateTable
CREATE TABLE "bank_account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "ifscCode" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "holderName" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bank_account_userId_accountNumber_key" ON "bank_account"("userId", "accountNumber");

-- AddForeignKey
ALTER TABLE "bank_account" ADD CONSTRAINT "bank_account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "on_ramp_transaction" ADD CONSTRAINT "on_ramp_transaction_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
