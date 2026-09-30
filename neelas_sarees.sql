-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 04, 2026 at 02:24 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `neelas_sarees`
--

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `id` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `name` varchar(191) NOT NULL,
  `phone` varchar(191) NOT NULL,
  `line1` varchar(191) NOT NULL,
  `line2` varchar(191) DEFAULT NULL,
  `city` varchar(191) NOT NULL,
  `state` varchar(191) NOT NULL,
  `pincode` varchar(191) NOT NULL,
  `isDefault` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` varchar(36) NOT NULL,
  `text` varchar(500) NOT NULL,
  `emoji` varchar(10) DEFAULT '',
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `sortOrder` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `banners`
--

CREATE TABLE `banners` (
  `id` varchar(36) NOT NULL,
  `title` varchar(191) NOT NULL,
  `subtitle` varchar(191) DEFAULT NULL,
  `image` varchar(500) NOT NULL,
  `badge` varchar(100) DEFAULT NULL,
  `ctaText` varchar(100) DEFAULT NULL,
  `ctaLink` varchar(191) DEFAULT NULL,
  `textPosition` enum('left','right') NOT NULL DEFAULT 'left',
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `sortOrder` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `productId` varchar(36) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` varchar(36) NOT NULL,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `type` enum('FABRIC','OCCASION','COLLECTION') NOT NULL,
  `image` varchar(191) DEFAULT NULL,
  `description` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `sortOrder` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `type`, `image`, `description`, `isActive`, `sortOrder`, `createdAt`) VALUES
('cat_banarasi', 'Banarasi Silk', 'banarasi-silk', 'FABRIC', NULL, 'Handwoven Banarasi silk with intricate zari', 1, 2, '2026-07-20 14:24:51.000'),
('cat_bestseller', 'Best Sellers', 'best-sellers', 'COLLECTION', NULL, 'Most loved sarees by customers', 1, 18, '2026-07-20 14:24:51.000'),
('cat_casual', 'Casual Wear', 'casual', 'OCCASION', NULL, 'Effortless sarees for relaxed outings', 1, 16, '2026-07-20 14:24:51.000'),
('cat_chiffon', 'Chiffon', 'chiffon', 'FABRIC', NULL, 'Flowy chiffon sarees with elegant drape', 1, 7, '2026-07-20 14:24:51.000'),
('cat_cotton', 'Cotton Sarees', 'cotton', 'FABRIC', NULL, 'Breathable cotton sarees for everyday elegance', 1, 1, '2026-07-20 14:24:51.000'),
('cat_daily', 'Daily Wear', 'daily', 'OCCASION', NULL, 'Comfortable everyday casual sarees', 1, 14, '2026-07-20 14:24:51.000'),
('cat_festive', 'Festive Wear', 'festive', 'OCCASION', NULL, 'Celebrate every festival in style', 1, 12, '2026-07-20 14:24:51.000'),
('cat_georgette', 'Georgette', 'georgette', 'FABRIC', NULL, 'Georgette sarees with prints and embellishments', 1, 8, '2026-07-20 14:24:51.000'),
('cat_kanjivaram', 'Kanjivaram Silk', 'kanjivaram', 'FABRIC', NULL, 'Pure Kanjivaram silk with temple borders', 1, 3, '2026-07-20 14:24:51.000'),
('cat_linen', 'Linen Sarees', 'linen', 'FABRIC', NULL, 'Contemporary linen sarees for modern women', 1, 6, '2026-07-20 14:24:51.000'),
('cat_new', 'New Arrivals', 'new-arrivals', 'COLLECTION', NULL, 'Freshly added sarees', 1, 17, '2026-07-20 14:24:51.000'),
('cat_office', 'Office Wear', 'office', 'OCCASION', NULL, 'Professional yet elegant workplace sarees', 1, 13, '2026-07-20 14:24:51.000'),
('cat_organza', 'Organza', 'organza', 'FABRIC', NULL, 'Sheer organza sarees with delicate work', 1, 4, '2026-07-20 14:24:51.000'),
('cat_party', 'Party Wear', 'party', 'OCCASION', NULL, 'Stand out at parties and evening events', 1, 15, '2026-07-20 14:24:51.000'),
('cat_patola', 'Patola', 'patola', 'FABRIC', NULL, 'Double ikat Patola sarees from Gujarat', 1, 10, '2026-07-20 14:24:51.000'),
('cat_sale', 'Sale', 'sale', 'COLLECTION', NULL, 'Limited time deals', 1, 21, '2026-07-20 14:24:51.000'),
('cat_silk', 'Pure Silk', 'pure-silk', 'FABRIC', NULL, 'Luxurious pure silk for special moments', 1, 9, '2026-07-20 14:24:51.000'),
('cat_tussar', 'Tussar Silk', 'tussar-silk', 'FABRIC', NULL, 'Natural gold-hued tussar silk sarees', 1, 5, '2026-07-20 14:24:51.000'),
('cat_under1999', 'Under ₹1999', 'under-1999', 'COLLECTION', NULL, 'Premium sarees at great prices', 1, 20, '2026-07-20 14:24:51.000'),
('cat_under999', 'Under ₹999', 'under-999', 'COLLECTION', NULL, 'Budget-friendly stylish sarees', 1, 19, '2026-07-20 14:24:51.000'),
('cat_wedding', 'Wedding Sarees', 'wedding', 'OCCASION', NULL, 'Bridal and wedding guest sarees', 1, 11, '2026-07-20 14:24:51.000');

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` varchar(36) NOT NULL,
  `code` varchar(191) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `displayTitle` varchar(100) DEFAULT NULL,
  `type` enum('PERCENTAGE','FIXED') NOT NULL,
  `value` double NOT NULL,
  `minOrderValue` double NOT NULL DEFAULT 0,
  `maxUses` int(11) DEFAULT NULL,
  `usedCount` int(11) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `autoApply` tinyint(1) NOT NULL DEFAULT 0,
  `trigger` enum('FIRST_ORDER','THRESHOLD','LOYALTY','FESTIVE','EXIT_INTENT','MANUAL') NOT NULL DEFAULT 'MANUAL',
  `thresholdMin` double DEFAULT NULL,
  `thresholdMax` double DEFAULT NULL,
  `loyaltyOrderCount` int(11) DEFAULT NULL,
  `priority` int(11) NOT NULL DEFAULT 0,
  `expiresAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`id`, `code`, `description`, `displayTitle`, `type`, `value`, `minOrderValue`, `maxUses`, `usedCount`, `isActive`, `autoApply`, `trigger`, `thresholdMin`, `thresholdMax`, `loyaltyOrderCount`, `priority`, `expiresAt`, `createdAt`) VALUES
('coup_001', 'WELCOME10', 'Get 10% off on your first order', 'Welcome Offer', 'PERCENTAGE', 10, 500, NULL, 0, 1, 0, 'MANUAL', NULL, NULL, NULL, 0, NULL, '2026-06-29 10:27:32.000'),
('coup_002', 'FLAT200', 'Flat ₹200 off on orders above ₹1,500', 'Flat Discount', 'FIXED', 200, 1500, 500, 1, 1, 0, 'MANUAL', NULL, NULL, NULL, 0, '2026-12-31 23:59:59.000', '2026-06-29 10:27:32.000'),
('coup_003', 'SUMMER15', '15% off on summer collection (min ₹999)', 'Summer Sale', 'PERCENTAGE', 15, 999, 200, 0, 1, 0, 'MANUAL', NULL, NULL, NULL, 0, '2026-08-31 23:59:59.000', '2026-06-29 10:27:32.000'),
('coup_004', 'FESTIVE20', '20% off for festive season (min ₹2,000)', 'Festive Deal', 'PERCENTAGE', 20, 2000, 100, 0, 1, 0, 'MANUAL', NULL, NULL, NULL, 0, '2026-10-31 23:59:59.000', '2026-06-29 10:27:32.000'),
('coup_exit', 'STAYWITHUS', '5% extra off — valid for 30 minutes!', 'Don\'t Leave Yet!', 'PERCENTAGE', 5, 500, NULL, 0, 1, 0, 'EXIT_INTENT', NULL, NULL, NULL, 10, NULL, '2026-07-20 11:14:22.000'),
('coup_festive', 'NAVRATRI20', 'Extra 20% off this Navratri season', 'Festive Bonus', 'PERCENTAGE', 20, 2000, NULL, 0, 0, 1, 'FESTIVE', 2000, NULL, NULL, 95, '2026-10-15 23:59:59.000', '2026-07-20 11:14:22.000'),
('coup_first', 'NEELA10', 'Get 10% off on your first order', 'First Order Discount', 'PERCENTAGE', 10, 0, NULL, 0, 1, 1, 'FIRST_ORDER', NULL, NULL, NULL, 100, NULL, '2026-07-20 11:14:22.000'),
('coup_loyal10', 'SUPERFAN', '20% off + Free Shipping for super fans (10+ orders)', 'Super Fan Reward', 'PERCENTAGE', 20, 0, NULL, 0, 1, 0, 'LOYALTY', NULL, NULL, 10, 90, NULL, '2026-07-20 11:14:22.000'),
('coup_loyal3', 'LOYAL200', '₹200 off for loyal customers (3+ orders)', 'Loyalty Reward', 'FIXED', 200, 1500, NULL, 0, 1, 0, 'LOYALTY', NULL, NULL, 3, 80, NULL, '2026-07-20 11:14:22.000'),
('coup_loyal5', 'VIP15', '15% off for VIP customers (5+ orders)', 'VIP Exclusive', 'PERCENTAGE', 15, 0, NULL, 0, 1, 0, 'LOYALTY', NULL, NULL, 5, 85, NULL, '2026-07-20 11:14:22.000'),
('coup_t10000', 'ROYAL1000', 'Flat ₹1000 off on orders above ₹10,000', 'Royal Savings', 'FIXED', 1000, 10000, NULL, 1, 1, 0, 'THRESHOLD', 10000, NULL, NULL, 70, NULL, '2026-07-20 11:14:22.000'),
('coup_t3000', 'SAVE200', 'Flat ₹200 off on orders above ₹3,000', 'Spend More Save More', 'FIXED', 200, 3000, NULL, 1, 1, 0, 'THRESHOLD', 3000, 4999, NULL, 50, NULL, '2026-07-20 11:14:22.000'),
('coup_t5000', 'MEGA500', 'Flat ₹500 off on orders above ₹5,000', 'Mega Saver', 'FIXED', 500, 5000, NULL, 1, 1, 0, 'THRESHOLD', 5000, 9999, NULL, 60, NULL, '2026-07-20 11:14:22.000');

-- --------------------------------------------------------

--
-- Table structure for table `coupon_usage`
--

CREATE TABLE `coupon_usage` (
  `id` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `couponId` varchar(36) NOT NULL,
  `orderId` varchar(36) DEFAULT NULL,
  `usedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------

--
-- Table structure for table `customer_groups`
--

CREATE TABLE `customer_groups` (
  `id` varchar(36) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `color` varchar(20) NOT NULL DEFAULT '#6b7280',
  `isAutomatic` tinyint(1) NOT NULL DEFAULT 0,
  `rules` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`rules`)),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customer_groups`
--

INSERT INTO `customer_groups` (`id`, `name`, `description`, `color`, `isAutomatic`, `rules`, `createdAt`) VALUES
('grp_inactive', 'Inactive Customers', 'No orders in last 90 days', '#ef4444', 1, '{\"noOrderDays\": 90}', '2026-07-28 15:09:00.741'),
('grp_loyal', 'Loyal Customers', 'Customers with 3+ orders', '#16a34a', 1, '{\"minOrders\": 3}', '2026-07-28 15:09:00.741'),
('grp_new', 'New Customers', 'Customers with first order in last 30 days', '#3b82f6', 1, '{\"maxOrders\": 1, \"registeredWithin\": 30}', '2026-07-28 15:09:00.741'),
('grp_vip', 'VIP Customers', 'Customers with 5+ orders or ₹25,000+ total spend', '#9333ea', 1, '{\"minOrders\": 5, \"minSpend\": 25000}', '2026-07-28 15:09:00.741');

-- --------------------------------------------------------

--
-- Table structure for table `customer_group_members`
--

CREATE TABLE `customer_group_members` (
  `id` varchar(36) NOT NULL,
  `groupId` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `addedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notification_templates`
--

CREATE TABLE `notification_templates` (
  `id` varchar(36) NOT NULL,
  `name` varchar(191) NOT NULL,
  `type` enum('EMAIL','SMS','WHATSAPP') NOT NULL,
  `event` varchar(100) NOT NULL,
  `subject` varchar(500) DEFAULT NULL,
  `body` text NOT NULL,
  `variables` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`variables`)),
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notification_templates`
--

INSERT INTO `notification_templates` (`id`, `name`, `type`, `event`, `subject`, `body`, `variables`, `isActive`, `createdAt`, `updatedAt`) VALUES
('tmpl_order_confirm_email', 'Order Confirmation', 'EMAIL', 'ORDER_CONFIRMED', 'Your order #{orderId} is confirmed!', 'Hi {customerName},\n\nThank you for your order! Your order #{orderId} has been confirmed and is being processed.\n\nOrder Total: ₹{orderTotal}\n\nWe will notify you once your order is shipped.\n\nThank you,\nNeela\'s Sarees', '[\"orderId\", \"customerName\", \"orderTotal\"]', 1, '2026-07-28 15:09:00.812', '2026-07-28 15:09:00.812'),
('tmpl_order_confirm_sms', 'Order Confirmation SMS', 'SMS', 'ORDER_CONFIRMED', NULL, 'Hi {customerName}! Your order #{orderId} is confirmed. Total: ₹{orderTotal}. Thank you for shopping at Neela\'s Sarees!', '[\"orderId\", \"customerName\", \"orderTotal\"]', 1, '2026-07-28 15:09:00.812', '2026-07-28 15:09:00.812'),
('tmpl_order_confirm_whatsapp', 'Order Confirmation WhatsApp', 'WHATSAPP', 'ORDER_CONFIRMED', NULL, '🎉 Hi {customerName}!\n\nYour order *#{orderId}* is confirmed!\n\n💰 Total: ₹{orderTotal}\n\nWe\'ll update you when it ships. Thank you for choosing Neela\'s Sarees! 🙏', '[\"orderId\", \"customerName\", \"orderTotal\"]', 1, '2026-07-28 15:09:00.812', '2026-07-28 15:09:00.812'),
('tmpl_order_delivered_email', 'Order Delivered', 'EMAIL', 'ORDER_DELIVERED', 'Your order #{orderId} has been delivered!', 'Hi {customerName},\n\nYour order #{orderId} has been delivered successfully!\n\nWe hope you love your purchase. Please leave a review to help other customers.\n\nThank you,\nNeela\'s Sarees', '[\"orderId\", \"customerName\"]', 1, '2026-07-28 15:09:00.812', '2026-07-28 15:09:00.812'),
('tmpl_order_shipped_email', 'Order Shipped', 'EMAIL', 'ORDER_SHIPPED', 'Your order #{orderId} has been shipped!', 'Hi {customerName},\n\nGreat news! Your order #{orderId} has been shipped.\n\nTracking Number: {trackingNumber}\nShipping Partner: {shippingPartner}\n\nTrack your order: {trackingUrl}\n\nThank you,\nNeela\'s Sarees', '[\"orderId\", \"customerName\", \"trackingNumber\", \"shippingPartner\", \"trackingUrl\"]', 1, '2026-07-28 15:09:00.812', '2026-07-28 15:09:00.812'),
('tmpl_order_shipped_sms', 'Order Shipped SMS', 'SMS', 'ORDER_SHIPPED', NULL, 'Your order #{orderId} has been shipped via {shippingPartner}. Track: {trackingUrl}', '[\"orderId\", \"shippingPartner\", \"trackingUrl\"]', 1, '2026-07-28 15:09:00.812', '2026-07-28 15:09:00.812');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `addressId` varchar(36) NOT NULL,
  `status` enum('PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','RETURNED') NOT NULL DEFAULT 'PENDING',
  `paymentStatus` enum('PENDING','PAID','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  `paymentMethod` varchar(191) DEFAULT NULL,
  `razorpayOrderId` varchar(191) DEFAULT NULL,
  `razorpayPaymentId` varchar(191) DEFAULT NULL,
  `subtotal` double NOT NULL,
  `discount` double NOT NULL DEFAULT 0,
  `couponCode` varchar(191) DEFAULT NULL,
  `shippingCharge` double NOT NULL DEFAULT 0,
  `total` double NOT NULL,
  `trackingNumber` varchar(191) DEFAULT NULL,
  `shippingPartnerId` varchar(36) DEFAULT NULL,
  `estimatedDelivery` date DEFAULT NULL,
  `shippedAt` datetime(3) DEFAULT NULL,
  `deliveredAt` datetime(3) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` varchar(36) NOT NULL,
  `orderId` varchar(36) NOT NULL,
  `productId` varchar(36) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` double NOT NULL,
  `name` varchar(191) NOT NULL,
  `image` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `manual_invoices`
--

CREATE TABLE IF NOT EXISTS `manual_invoices` (
  `id` VARCHAR(36) NOT NULL,
  `invoice_number` VARCHAR(100) NOT NULL UNIQUE,
  `invoice_date` VARCHAR(50) NOT NULL,
  `due_date` VARCHAR(50) DEFAULT NULL,
  `customer_name` VARCHAR(191) NOT NULL,
  `customer_email` VARCHAR(191) DEFAULT NULL,
  `customer_phone` VARCHAR(50) DEFAULT NULL,
  `customer_address` TEXT DEFAULT NULL,
  `customer_gstin` VARCHAR(50) DEFAULT NULL,
  `payment_method` VARCHAR(50) DEFAULT 'Cash',
  `transaction_id` VARCHAR(100) DEFAULT NULL,
  `payment_status` VARCHAR(50) DEFAULT 'Paid',
  `seller_location` VARCHAR(255) DEFAULT NULL,
  `seller_landmark` VARCHAR(255) DEFAULT NULL,
  `seller_phone` VARCHAR(50) DEFAULT NULL,
  `seller_gstin` VARCHAR(50) DEFAULT NULL,
  `bank_account_holder` VARCHAR(191) DEFAULT NULL,
  `bank_name` VARCHAR(191) DEFAULT NULL,
  `bank_account_number` VARCHAR(100) DEFAULT NULL,
  `bank_ifsc` VARCHAR(50) DEFAULT NULL,
  `bank_branch` VARCHAR(191) DEFAULT NULL,
  `items` LONGTEXT NOT NULL,
  `subtotal` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `tax_rate` DECIMAL(5, 2) NOT NULL DEFAULT 5.00,
  `tax_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `discount_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `shipping_charge` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `grand_total` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `notes` TEXT DEFAULT NULL,
  `email_sent` TINYINT(1) NOT NULL DEFAULT 0,
  `last_email_sent_at` DATETIME NULL DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `idx_invoice_number` (`invoice_number`),
  INDEX `idx_customer_name` (`customer_name`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` varchar(36) NOT NULL,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `price` double NOT NULL,
  `comparePrice` double DEFAULT NULL,
  `sku` varchar(191) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`images`)),
  `fabric` varchar(191) NOT NULL,
  `occasion` varchar(191) NOT NULL,
  `color` varchar(191) NOT NULL,
  `blouseIncluded` tinyint(1) NOT NULL DEFAULT 0,
  `careInstructions` varchar(191) DEFAULT NULL,
  `isFeatured` tinyint(1) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `categoryId` varchar(36) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_color_variants`
--

CREATE TABLE IF NOT EXISTS `product_color_variants` (
  `id` varchar(36) NOT NULL,
  `productId` varchar(36) NOT NULL,
  `colorName` varchar(191) NOT NULL,
  `colorHex` varchar(7) NOT NULL DEFAULT '#000000',
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`images`)),
  `stock` int(11) NOT NULL DEFAULT 0,
  `sortOrder` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `idx_variant_product` (`productId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `productId` varchar(36) NOT NULL,
  `rating` int(11) NOT NULL,
  `title` varchar(191) DEFAULT NULL,
  `body` text NOT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `isApproved` tinyint(1) NOT NULL DEFAULT 0,
  `helpfulCount` int(11) NOT NULL DEFAULT 0,
  `notHelpfulCount` int(11) NOT NULL DEFAULT 0,
  `isEdited` tinyint(1) NOT NULL DEFAULT 0,
  `editedBy` varchar(36) DEFAULT NULL,
  `editedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `review_votes`
--

CREATE TABLE `review_votes` (
  `id` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `reviewId` varchar(36) NOT NULL,
  `vote` enum('HELPFUL','NOT_HELPFUL') NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shipping_partners`
--

CREATE TABLE `shipping_partners` (
  `id` varchar(36) NOT NULL,
  `name` varchar(191) NOT NULL,
  `code` varchar(50) NOT NULL,
  `trackingUrl` varchar(500) DEFAULT NULL,
  `contactPhone` varchar(50) DEFAULT NULL,
  `contactEmail` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shipping_partners`
--

INSERT INTO `shipping_partners` (`id`, `name`, `code`, `trackingUrl`, `contactPhone`, `contactEmail`, `isActive`, `createdAt`) VALUES
('ship_bluedart', 'Blue Dart', 'BLUEDART', 'https://www.bluedart.com/tracking?id={tracking}', NULL, NULL, 1, '2026-07-28 15:09:00.772'),
('ship_delhivery', 'Delhivery', 'DELHIVERY', 'https://www.delhivery.com/track/package/{tracking}', NULL, NULL, 1, '2026-07-28 15:09:00.772'),
('ship_dtdc', 'DTDC', 'DTDC', 'https://www.dtdc.in/tracking.asp?strCnno={tracking}', NULL, NULL, 1, '2026-07-28 15:09:00.772'),
('ship_ecom', 'Ecom Express', 'ECOM', 'https://www.ecomexpress.in/tracking/?awb_field={tracking}', NULL, NULL, 1, '2026-07-28 15:09:00.772'),
('ship_india_post', 'India Post', 'INDIAPOST', 'https://www.indiapost.gov.in/_layouts/15/DOP.Portal.Tracking/TrackConsignment.aspx?id={tracking}', NULL, NULL, 1, '2026-07-28 15:09:00.772');

-- --------------------------------------------------------

--
-- Table structure for table `stock_adjustments`
--

CREATE TABLE `stock_adjustments` (
  `id` varchar(36) NOT NULL,
  `productId` varchar(36) NOT NULL,
  `type` enum('ADD','REMOVE','SET','RETURN','DAMAGE','RECOUNT') NOT NULL,
  `quantity` int(11) NOT NULL,
  `previousStock` int(11) NOT NULL,
  `newStock` int(11) NOT NULL,
  `reason` varchar(500) DEFAULT NULL,
  `adjustedBy` varchar(36) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `testimonials`
--

CREATE TABLE `testimonials` (
  `id` varchar(36) NOT NULL,
  `name` varchar(191) NOT NULL,
  `body` text NOT NULL,
  `rating` int(11) NOT NULL DEFAULT 5,
  `avatar` varchar(500) DEFAULT NULL,
  `designation` varchar(191) NOT NULL DEFAULT 'Happy Customer',
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `sortOrder` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `testimonials`
--

INSERT INTO `testimonials` (`id`, `name`, `body`, `rating`, `avatar`, `designation`, `isActive`, `sortOrder`, `createdAt`) VALUES
('cmr5w1o4wxu4gblVE', 'Kaviya', 'Good to know about this site and product.', 5, 'https://res.cloudinary.com/dbzo38cdi/image/upload/v1783140887/neelas-sarees/cyct2zewzkjw0eylt7zs.jpg', 'Happy Customer', 1, 0, '2026-07-04 10:24:49.713'),
('cmr5w29zmhAI6Q1b-', 'Deepa', 'Good to know about this site and product.', 5, 'https://res.cloudinary.com/dbzo38cdi/image/upload/v1783140915/neelas-sarees/wpuui6vny1po4oxksq5o.jpg', 'Happy Customer', 1, 1, '2026-07-04 10:25:18.038'),
('cmr5w3lh4Q7sXxVBA', 'Deepa Balu', 'Good to know about this site and product.', 3, 'https://res.cloudinary.com/dbzo38cdi/image/upload/v1783140977/neelas-sarees/tg2a5wka1d1dzlxxuo2j.jpg', 'Happy Customer', 1, 2, '2026-07-04 10:26:19.577'),
('cmr5w42efuTG_IgUY', 'Ramya', 'Good to know about this site and product.', 5, 'https://res.cloudinary.com/dbzo38cdi/image/upload/v1783140999/neelas-sarees/rrgynz372xlloeydvofu.jpg', 'Happy Customer', 1, 5, '2026-07-04 10:26:41.512'),
('cmr5w4muw0RKxUGMk', 'Saranya', 'Good to know about this site and product.', 5, 'https://res.cloudinary.com/dbzo38cdi/image/upload/v1783141026/neelas-sarees/cw7xjse3hpbs8bktfmoq.jpg', 'Happy Customer', 1, 0, '2026-07-04 10:27:08.025'),
('test_001', 'Priya Lakshmi', 'I have been shopping at Neela\'s for over a year now and every saree I\'ve bought has been exceptional quality. The Banarasi collection is to die for! Customer service is also wonderful.', 5, NULL, 'Loyal Customer, Chennai', 1, 1, '2026-05-20 10:00:00.000'),
('test_002', 'Kavitha Rajan', 'Found Neela\'s through a friend\'s recommendation and I\'m so glad I did. The Kanjivaram sarees are authentic and the prices are very fair compared to what you\'d pay at a brick and mortar store.', 5, NULL, 'Repeat Buyer, Trichy', 1, 2, '2026-04-15 11:00:00.000'),
('test_003', 'Revathi Krishnan', 'As someone who buys a lot of sarees for various occasions, I can confidently say Neela\'s has the best online collection. The packaging, the quality, the variety — everything is top notch.', 5, NULL, 'VIP Member, Chennai', 1, 3, '2026-06-10 08:00:00.000'),
('test_004', 'Meenakshi Sundaram', 'Bought a Banarasi silk for my daughter\'s engagement and it was absolutely stunning. Everyone at the function asked where I got it from. Thank you Neela\'s for making the day special!', 5, NULL, 'Happy Mother, Coimbatore', 1, 4, '2026-03-20 15:00:00.000'),
('test_005', 'Sangeetha Murali', 'The cotton sarees from Neela\'s are perfect for Chennai summers. Soft, breathable, and the prints are unique. I\'ve already recommended them to all my friends and colleagues.', 4, NULL, 'Office Goer, Chennai', 1, 5, '2026-07-01 12:00:00.000'),
('test_006', 'Anitha Devi', 'My first order and I\'m already planning my second! The Sea Blue Cotton saree is even more beautiful in person. Love the sustainable packaging too. A brand with values!', 5, NULL, 'New Customer, Salem', 1, 6, '2026-07-20 14:00:00.000');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `role` enum('CUSTOMER','ADMIN','SUPER_ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  `isVerified` tinyint(1) NOT NULL DEFAULT 0,
  `refreshToken` text DEFAULT NULL,
  `orderCount` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `role`, `isVerified`, `refreshToken`, `orderCount`, `createdAt`, `updatedAt`) VALUES
('user_admin_001', 'Neelas Admin', 'admin@neelassarees.com', '$2b$12$zSw/w9vf9Sw1ursmqNr.ge6mXuhuuR2C7iKwq2RqPaf9NKQ4ILGaO', '+91 99999 99999', 'SUPER_ADMIN', 1, NULL, 0, '2026-06-29 10:27:32.000', '2026-06-29 10:27:32.000'),
('user_admin_002', 'Development Affixx', 'developmentaffixx@gmail.com', '$2b$12$nVKdlnl62YO9krzYFBGgfeSxQ/ZKSVtB3l2ztdqC2cU.k85VaHv0i', NULL, 'ADMIN', 1, NULL, 0, '2026-06-29 10:29:56.000', '2026-07-28 15:09:52.015');

-- --------------------------------------------------------

--
-- Table structure for table `wishlists`
--

CREATE TABLE `wishlists` (
  `id` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `productId` varchar(36) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `addresses_userId_fk` (`userId`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cart_items_userId_productId_key` (`userId`,`productId`),
  ADD KEY `cart_items_productId_fk` (`productId`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_slug_key` (`slug`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `coupons_code_key` (`code`);

--
-- Indexes for table `coupon_usage`
--
ALTER TABLE `coupon_usage`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `coupon_usage_user_coupon_key` (`userId`,`couponId`),
  ADD KEY `coupon_usage_userId_fk` (`userId`),
  ADD KEY `coupon_usage_couponId_fk` (`couponId`);

--
-- Indexes for table `customer_groups`
--
ALTER TABLE `customer_groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `customer_groups_name_key` (`name`);

--
-- Indexes for table `customer_group_members`
--
ALTER TABLE `customer_group_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cgm_group_user_key` (`groupId`,`userId`),
  ADD KEY `cgm_userId_fk` (`userId`);

--
-- Indexes for table `notification_templates`
--
ALTER TABLE `notification_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `notification_templates_event_type_key` (`event`,`type`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orders_userId_fk` (`userId`),
  ADD KEY `orders_addressId_fk` (`addressId`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_items_orderId_fk` (`orderId`),
  ADD KEY `order_items_productId_fk` (`productId`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_slug_key` (`slug`),
  ADD UNIQUE KEY `products_sku_key` (`sku`),
  ADD KEY `products_categoryId_fk` (`categoryId`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reviews_productId_fk` (`productId`),
  ADD KEY `reviews_userId_fk` (`userId`);

--
-- Indexes for table `review_votes`
--
ALTER TABLE `review_votes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `review_votes_user_review_key` (`userId`,`reviewId`),
  ADD KEY `review_votes_reviewId_fk` (`reviewId`);

--
-- Indexes for table `shipping_partners`
--
ALTER TABLE `shipping_partners`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `shipping_partners_code_key` (`code`);

--
-- Indexes for table `stock_adjustments`
--
ALTER TABLE `stock_adjustments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `stock_adj_productId_fk` (`productId`),
  ADD KEY `stock_adj_adjustedBy_fk` (`adjustedBy`);

--
-- Indexes for table `testimonials`
--
ALTER TABLE `testimonials`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`);

--
-- Indexes for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `wishlists_userId_productId_key` (`userId`,`productId`),
  ADD KEY `wishlists_productId_fk` (`productId`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_userId_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_productId_fk` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `cart_items_userId_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `coupon_usage`
--
ALTER TABLE `coupon_usage`
  ADD CONSTRAINT `coupon_usage_couponId_fk` FOREIGN KEY (`couponId`) REFERENCES `coupons` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `coupon_usage_userId_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `customer_group_members`
--
ALTER TABLE `customer_group_members`
  ADD CONSTRAINT `cgm_groupId_fk` FOREIGN KEY (`groupId`) REFERENCES `customer_groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cgm_userId_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_addressId_fk` FOREIGN KEY (`addressId`) REFERENCES `addresses` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_userId_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_orderId_fk` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_productId_fk` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_categoryId_fk` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_productId_fk` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `reviews_userId_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `review_votes`
--
ALTER TABLE `review_votes`
  ADD CONSTRAINT `review_votes_reviewId_fk` FOREIGN KEY (`reviewId`) REFERENCES `reviews` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `review_votes_userId_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stock_adjustments`
--
ALTER TABLE `stock_adjustments`
  ADD CONSTRAINT `stock_adj_adjustedBy_fk` FOREIGN KEY (`adjustedBy`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `stock_adj_productId_fk` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD CONSTRAINT `wishlists_productId_fk` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wishlists_userId_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
