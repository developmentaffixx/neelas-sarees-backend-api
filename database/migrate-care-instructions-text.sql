-- Migration: widen products.careInstructions from VARCHAR(191) to TEXT
-- Reason: care instructions can be longer than 191 characters.
-- Safe to run on an existing database (no data loss — TEXT is wider than VARCHAR).

ALTER TABLE `products`
  MODIFY COLUMN `careInstructions` TEXT DEFAULT NULL;
