-- AlterTable
ALTER TABLE `user` MODIFY `photo` TEXT NULL;

-- RenameIndex
ALTER TABLE `cardshard` RENAME INDEX `CardShard_cardName_key` TO `unique_cardName`;
