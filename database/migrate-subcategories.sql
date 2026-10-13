-- Migration: Add parentId to categories to support Sub-categories (Parent -> Subcategory hierarchy)
-- Run this query in phpMyAdmin / MySQL

ALTER TABLE `categories` 
ADD COLUMN `parentId` VARCHAR(36) NULL DEFAULT NULL AFTER `id`;

ALTER TABLE `categories` 
ADD CONSTRAINT `fk_category_parent` 
FOREIGN KEY (`parentId`) REFERENCES `categories` (`id`) ON DELETE SET NULL;
