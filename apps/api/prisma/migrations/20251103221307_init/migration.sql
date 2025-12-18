-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('sedentary', 'light', 'moderate', 'active');

-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('lose_weight', 'maintain', 'gain_muscle');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firebase_uid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT,
    "age" INTEGER,
    "height_cm" INTEGER,
    "weight_kg" DOUBLE PRECISION,
    "activity_level" "ActivityLevel",
    "goal_type" "GoalType",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "daily_kcal" INTEGER NOT NULL,
    "carb_pct" INTEGER NOT NULL DEFAULT 50,
    "protein_pct" INTEGER NOT NULL DEFAULT 25,
    "fat_pct" INTEGER NOT NULL DEFAULT 25,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodDictionary" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kcal_per_100g" DOUBLE PRECISION NOT NULL,
    "protein_per_100g" DOUBLE PRECISION NOT NULL,
    "carb_per_100g" DOUBLE PRECISION NOT NULL,
    "fat_per_100g" DOUBLE PRECISION NOT NULL,
    "serving_unit" TEXT,
    "serving_grams" DOUBLE PRECISION,
    "stock_image_url" TEXT,

    CONSTRAINT "FoodDictionary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "times_json" TEXT NOT NULL,
    "days_json" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "badge_id" TEXT NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_firebase_uid_key" ON "User"("firebase_uid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Goal_user_id_key" ON "Goal"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_code_key" ON "Badge"("code");

-- CreateIndex
CREATE UNIQUE INDEX "UserBadge_user_id_badge_id_key" ON "UserBadge"("user_id", "badge_id");

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
