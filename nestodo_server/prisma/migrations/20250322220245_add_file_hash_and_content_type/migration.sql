/*
  Warnings:

  - Added the required column `contentType` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileHash` to the `Attachment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "contentType" TEXT NOT NULL,
ADD COLUMN     "fileHash" TEXT NOT NULL;
