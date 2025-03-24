/*
  Warnings:

  - You are about to drop the column `path` on the `Attachment` table. All the data in the column will be lost.
  - Added the required column `originalFileName` to the `Attachment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attachment" DROP COLUMN "path",
ADD COLUMN     "originalFileName" TEXT NOT NULL;
