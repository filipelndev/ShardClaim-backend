-- CreateTable
CREATE TABLE `CardShard` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cardName` VARCHAR(191) NOT NULL,
    `cardPhoto` VARCHAR(191) NULL,
    `claimedAt` DATETIME(3) NULL,
    `userId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CardShard` ADD CONSTRAINT `CardShard_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
