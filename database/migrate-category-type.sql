-- Migration: Change categories.type from ENUM to VARCHAR to support dynamic custom types
-- Run this once on your database

ALTER TABLE `categories` MODIFY COLUMN `type` VARCHAR(50) NOT NULL DEFAULT 'FABRIC';
