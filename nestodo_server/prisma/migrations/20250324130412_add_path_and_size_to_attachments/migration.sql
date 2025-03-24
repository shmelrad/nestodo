/*
  Warnings:

  - You are about to drop the column `fileHash` on the `Attachment` table. All the data in the column will be lost.
  - Added the required column `path` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Attachment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attachment" DROP COLUMN "fileHash",
ADD COLUMN     "path" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL;
