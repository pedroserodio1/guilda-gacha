/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `UserAction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserAction_userId_key" ON "UserAction"("userId");
