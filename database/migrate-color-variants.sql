-- Migration: Add product_color_variants table
-- Run this on your database to enable the color variants feature.

CREATE TABLE IF NOT EXISTS `product_color_variants` (
  `id`        varchar(36)  NOT NULL,
  `productId` varchar(36)  NOT NULL,
  `colorName` varchar(191) NOT NULL,
  `colorHex`  varchar(7)   NOT NULL DEFAULT '#000000',
  `images`    longtext     CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`images`)),
  `stock`     int(11)      NOT NULL DEFAULT 0,
  `sortOrder` int(11)      NOT NULL DEFAULT 0,
  `createdAt` datetime(3)  NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3)  NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `idx_variant_product` (`productId`),
  CONSTRAINT `fk_variant_product` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
