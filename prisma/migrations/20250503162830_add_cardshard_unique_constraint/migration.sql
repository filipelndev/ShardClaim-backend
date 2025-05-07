/*
  Warnings:

  - A unique constraint covering the columns `[cardName]` on the table `CardShard` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `cardshard` DROP FOREIGN KEY `CardShard_accountId_fkey`;

-- CreateTable
CREATE TABLE `_ShardCollectors` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ShardCollectors_AB_unique`(`A`, `B`),
    INDEX `_ShardCollectors_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ShardQueue` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ShardQueue_AB_unique`(`A`, `B`),
    INDEX `_ShardQueue_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `CardShard_cardName_key` ON `CardShard`(`cardName`);

-- AddForeignKey
ALTER TABLE `CardShard` ADD CONSTRAINT `Account_Shards_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ShardCollectors` ADD CONSTRAINT `_ShardCollectors_A_fkey` FOREIGN KEY (`A`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ShardCollectors` ADD CONSTRAINT `_ShardCollectors_B_fkey` FOREIGN KEY (`B`) REFERENCES `CardShard`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ShardQueue` ADD CONSTRAINT `_ShardQueue_A_fkey` FOREIGN KEY (`A`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ShardQueue` ADD CONSTRAINT `_ShardQueue_B_fkey` FOREIGN KEY (`B`) REFERENCES `CardShard`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
