-- CreateTable
CREATE TABLE "meetings" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "location" TEXT,
    "scheduled_at" TIMESTAMP(3),
    "actual_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'planned',
    "anchors" TEXT,
    "notes" TEXT,
    "outcomes" TEXT,
    "follow_up_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
