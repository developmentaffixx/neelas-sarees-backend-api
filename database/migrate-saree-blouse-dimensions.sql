-- Migration: Add optional sareeLength and blouseLength to products table
-- Run this once on your database

ALTER TABLE `products` 
  ADD COLUMN IF NOT EXISTS `sareeLength` VARCHAR(100) NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `blouseLength` VARCHAR(100) NULL DEFAULT NULL;
