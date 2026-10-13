-- Migration: Add sku and careInstructions to categories table
ALTER TABLE `categories` ADD COLUMN `sku` VARCHAR(100) NULL DEFAULT NULL AFTER `name`;
ALTER TABLE `categories` ADD COLUMN `careInstructions` TEXT NULL DEFAULT NULL AFTER `description`;
