-- CreateEnum
CREATE TYPE "CryptoPaymentStatus" AS ENUM ('PENDING', 'PAID', 'EXPIRED', 'FAILED');

-- CreateTable
CREATE TABLE "crypto_payments" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "amount_usd" DOUBLE PRECISION NOT NULL,
    "amount_usdt" DOUBLE PRECISION NOT NULL,
    "asset" TEXT NOT NULL,
    "status" "CryptoPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payload" TEXT NOT NULL,
    "confirmed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subscription_id" INTEGER,

    CONSTRAINT "crypto_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "crypto_payments_invoice_id_key" ON "crypto_payments"("invoice_id");

-- AddForeignKey
ALTER TABLE "crypto_payments" ADD CONSTRAINT "crypto_payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crypto_payments" ADD CONSTRAINT "crypto_payments_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
