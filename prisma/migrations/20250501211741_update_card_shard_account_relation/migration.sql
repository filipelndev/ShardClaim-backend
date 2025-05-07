/*
  Warnings:

  - You are about to drop the column `userId` on the `cardshard` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `cardshard` DROP FOREIGN KEY `CardShard_userId_fkey`;

-- DropIndex
DROP INDEX `CardShard_userId_fkey` ON `cardshard`;

-- AlterTable
ALTER TABLE `cardshard` DROP COLUMN `userId`,
    ADD COLUMN `accountId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `CardShard` ADD CONSTRAINT `CardShard_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
