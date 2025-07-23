-- CreateTable
CREATE TABLE "Campaigns" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewport_x" DOUBLE PRECISION,
    "viewport_y" DOUBLE PRECISION,
    "viewport_zoom" DOUBLE PRECISION,

    CONSTRAINT "Campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapElements" (
    "element_id" TEXT NOT NULL,
    "campaign_id" INTEGER NOT NULL,
    "type" TEXT,
    "position_x" DOUBLE PRECISION NOT NULL,
    "position_y" DOUBLE PRECISION NOT NULL,
    "data" JSONB,
    "parent_element_id" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MapElements_pkey" PRIMARY KEY ("element_id")
);

-- CreateTable
CREATE TABLE "MapLinks" (
    "link_id" TEXT NOT NULL,
    "campaign_id" INTEGER NOT NULL,
    "source_element_id" TEXT NOT NULL,
    "target_element_id" TEXT NOT NULL,

    CONSTRAINT "MapLinks_pkey" PRIMARY KEY ("link_id")
);

-- AddForeignKey
ALTER TABLE "MapElements" ADD CONSTRAINT "MapElements_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "Campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapLinks" ADD CONSTRAINT "MapLinks_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "Campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
