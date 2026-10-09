-- Migration: add variantId column to cart_items
-- Allows color-variant-specific cart lines to be preserved on the server.
-- Run once against your MySQL database.
--
-- Error fix: MySQL refused to DROP the unique key directly because it
-- considers it tied to FK constraints. We temporarily drop both FKs,
-- rework the unique key, then restore the FKs.

-- ── Step 1: Drop foreign key constraints temporarily ─────────────────────────
ALTER TABLE `cart_items`
  DROP FOREIGN KEY `cart_items_productId_fk`,
  DROP FOREIGN KEY `cart_items_userId_fk`;

-- ── Step 2: Drop the old unique key (userId + productId) ─────────────────────
ALTER TABLE `cart_items`
  DROP INDEX `cart_items_userId_productId_key`;

-- ── Step 3: Add the variantId column ─────────────────────────────────────────
-- NULL means "base product selected, no colour variant".
ALTER TABLE `cart_items`
  ADD COLUMN `variantId` varchar(36) NULL DEFAULT NULL AFTER `productId`;

-- ── Step 4: Add new unique key (userId + productId + variantId) ──────────────
-- MySQL treats two NULL values as distinct in a UNIQUE index, so a user can
-- have one "base product" line (variantId IS NULL) alongside variant lines.
ALTER TABLE `cart_items`
  ADD UNIQUE KEY `cart_items_userId_productId_variantId_key` (`userId`, `productId`, `variantId`);

-- ── Step 5: Restore the foreign key constraints ───────────────────────────────
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_productId_fk`
    FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `cart_items_userId_fk`
    FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
