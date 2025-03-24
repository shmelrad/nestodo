/*
  Warnings:

  - You are about to drop the column `tags` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "tags";

-- CreateTable
CREATE TABLE "_TaskToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TaskToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TaskToTag_B_index" ON "_TaskToTag"("B");

-- AddForeignKey
ALTER TABLE "_TaskToTag" ADD CONSTRAINT "_TaskToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskToTag" ADD CONSTRAINT "_TaskToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "WorkspaceTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
