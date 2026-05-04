-- Add phone_hash and allow_contact_matching to users
ALTER TABLE "users" ADD COLUMN "phone_hash" TEXT;
ALTER TABLE "users" ADD COLUMN "allow_contact_matching" BOOLEAN NOT NULL DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS "users_phone_hash_key" ON "users"("phone_hash") WHERE "phone_hash" IS NOT NULL;