-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "telegram_id" BIGINT NOT NULL,
    "username" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "language_code" TEXT,
    "is_premium" BOOLEAN,
    "photo_url" TEXT,
    "is_organizer" BOOLEAN NOT NULL DEFAULT false,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_cards" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "contact_id" TEXT NOT NULL,
    "business_name" TEXT,
    "resources" TEXT,
    "personal_data" TEXT,
    "qr_code_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "contact_id" TEXT NOT NULL,
    "business_name" TEXT,
    "resources" TEXT,
    "personal_data" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "referrer_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "referrer_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "organizer_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_registrations" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_telegram_id_key" ON "users"("telegram_id");

-- CreateIndex
CREATE UNIQUE INDEX "business_cards_contact_id_key" ON "business_cards"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_user_id_contact_id_key" ON "contacts"("user_id", "contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_user_id_referrer_id_key" ON "referrals"("user_id", "referrer_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_registrations_event_id_user_id_key" ON "event_registrations"("event_id", "user_id");

-- AddForeignKey
ALTER TABLE "business_cards" ADD CONSTRAINT "business_cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_logs" ADD CONSTRAINT "referral_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_logs" ADD CONSTRAINT "referral_logs_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
