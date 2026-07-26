-- CreateTable
CREATE TABLE "travel_wishlist_items" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'flight',
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "target_price" DECIMAL(12,2),
    "current_price" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "origin" TEXT,
    "destination" TEXT,
    "airline" TEXT,
    "flight_number" TEXT,
    "departure_date" TIMESTAMP(3),
    "hotel_name" TEXT,
    "hotel_address" TEXT,
    "check_in" TIMESTAMP(3),
    "check_out" TIMESTAMP(3),
    "nights" INTEGER,
    "room_type" TEXT,
    "country" TEXT,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travel_wishlist_items_pkey" PRIMARY KEY ("id")
);
