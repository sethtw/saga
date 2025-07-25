-- AlterTable
ALTER TABLE "MapElements" ADD COLUMN     "object_type" TEXT NOT NULL DEFAULT 'character';

-- CreateIndex
CREATE INDEX "MapElements_object_type_idx" ON "MapElements"("object_type");
