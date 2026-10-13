-- Migration: Drop UNIQUE index on products.sku
-- Allows multiple color variations of the same saree design to share the same common SKU code (e.g. CC-CHK-01)
-- Run this query in phpMyAdmin / MySQL

ALTER TABLE `products` DROP INDEX `products_sku_key`;
