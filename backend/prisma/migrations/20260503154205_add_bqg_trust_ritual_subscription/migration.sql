-- AlterTable
ALTER TABLE "contacts" ADD COLUMN     "ai_suggested_role" TEXT,
ADD COLUMN     "archetype" TEXT,
ADD COLUMN     "circle" TEXT DEFAULT 'productivity',
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "last_interaction" TIMESTAMP(3),
ADD COLUMN     "private_meta" TEXT;

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "trial_start" TIMESTAMP(3),
    "trial_end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bqgs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "goal" TEXT NOT NULL,
    "missing_roles" TEXT,
    "quarter_start" TIMESTAMP(3) NOT NULL,
    "quarter_end" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bqgs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trust_interactions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "balance_delta" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trust_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_rituals" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "metrics" TEXT,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_rituals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "network_health_snapshots" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "density" DOUBLE PRECISION,
    "diversity" DOUBLE PRECISION,
    "freshness" DOUBLE PRECISION,
    "trust_balance" INTEGER NOT NULL DEFAULT 0,
    "total_contacts" INTEGER NOT NULL DEFAULT 0,
    "active_contacts" INTEGER NOT NULL DEFAULT 0,
    "support_circle" INTEGER NOT NULL DEFAULT 0,
    "productivity_circle" INTEGER NOT NULL DEFAULT 0,
    "development_circle" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "network_health_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_key" ON "subscriptions"("user_id");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bqgs" ADD CONSTRAINT "bqgs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_interactions" ADD CONSTRAINT "trust_interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_interactions" ADD CONSTRAINT "trust_interactions_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_rituals" ADD CONSTRAINT "review_rituals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "network_health_snapshots" ADD CONSTRAINT "network_health_snapshots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
