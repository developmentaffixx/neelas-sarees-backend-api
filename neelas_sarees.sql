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

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`id`, `userId`, `name`, `phone`, `line1`, `line2`, `city`, `state`, `pincode`, `isDefault`, `createdAt`) VALUES
('addr_anitha_1', 'cust_anitha', 'Anitha Devi', '+91 65432 10987', '89, Nehru Nagar, 1st Main', 'Near Bus Stand', 'Salem', 'Tamil Nadu', '636001', 1, '2026-07-23 11:46:42.576'),
('addr_deepa_1', 'cust_deepa', 'Deepa Venkatesh', '+91 54321 09876', '34, Thiruvalluvar Street', NULL, 'Thanjavur', 'Tamil Nadu', '613001', 1, '2026-07-23 11:46:42.576'),
('addr_kavitha_1', 'cust_kavitha', 'Kavitha Rajan', '+91 76543 21098', '56, Rajaji Road', 'Behind Central Station', 'Trichy', 'Tamil Nadu', '620001', 1, '2026-07-23 11:46:42.576'),
('addr_lalitha_1', 'cust_lalitha', 'Lalitha Subramani', '+91 21098 76543', '90, Sathyamurthy Nagar', NULL, 'Erode', 'Tamil Nadu', '638001', 1, '2026-07-23 11:46:42.576'),
('addr_meena_1', 'cust_meena', 'Meenakshi Sundaram', '+91 87654 32109', '78, MG Road, 4th Cross', 'Opposite City Mall', 'Coimbatore', 'Tamil Nadu', '641001', 1, '2026-07-23 11:46:42.576'),
('addr_meena_2', 'cust_meena', 'Meenakshi Sundaram', '+91 87654 32109', '23, Kamaraj Street', NULL, 'Madurai', 'Tamil Nadu', '625001', 0, '2026-07-23 11:46:42.576'),
('addr_priya_1', 'cust_priya', 'Priya Lakshmi', '+91 98765 43210', '12, Gandhi Nagar, 2nd Street', 'Near Apollo Hospital', 'Chennai', 'Tamil Nadu', '600042', 1, '2026-07-23 11:46:42.576'),
('addr_priya_2', 'cust_priya', 'Priya Lakshmi', '+91 98765 43210', '45, Anna Salai', 'Teynampet', 'Chennai', 'Tamil Nadu', '600018', 0, '2026-07-23 11:46:42.576'),
('addr_revathi_1', 'cust_revathi', 'Revathi Krishnan', '+91 32109 87654', '11, Poes Garden', '3rd Floor, Flat 3B', 'Chennai', 'Tamil Nadu', '600086', 1, '2026-07-23 11:46:42.576'),
('addr_sangeetha_1', 'cust_sangeetha', 'Sangeetha Murali', '+91 43210 98765', '67, Kamarajar Salai', 'Near Marina Beach', 'Chennai', 'Tamil Nadu', '600005', 1, '2026-07-23 11:46:42.576');

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
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `text`, `emoji`, `isActive`, `sortOrder`, `createdAt`) VALUES
('ann_001', 'FREE Shipping on all prepaid orders above ₹999', '🎉', 1, 1, '2026-07-03 17:38:26.000'),
('ann_002', 'New arrivals every week — Shop the latest collection', '✨', 1, 2, '2026-07-03 17:38:26.000'),
('ann_003', 'Use code WELCOME10 for 10% off your first order', '🏷️', 1, 3, '2026-07-03 17:38:26.000');

-- --------------------------------------------------------

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

--
-- Dumping data for table `banners`
--

INSERT INTO `banners` (`id`, `title`, `subtitle`, `image`, `badge`, `ctaText`, `ctaLink`, `textPosition`, `isActive`, `sortOrder`, `createdAt`) VALUES
('ban_001', 'Elegance in Every Drape', 'Discover our exclusive Banarasi Silk collection crafted by master weavers of Varanasi', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&q=80', 'New Collection', 'Shop Banarasi', '/collections/banarasi-silk', 'left', 1, 1, '2026-07-23 11:46:42.000'),
('ban_002', 'Summer Cotton Diaries', 'Lightweight, breathable cotton sarees perfect for everyday elegance', 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=1600&q=80', 'Trending Now', 'Shop Cotton', '/collections/cotton', 'right', 1, 2, '2026-07-23 11:46:42.000'),
('ban_003', 'Celebrate in Style', 'Festive & wedding wear that makes every moment unforgettable', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1600&q=80', 'Wedding Season', 'Explore Collection', '/collections/festive', 'left', 1, 3, '2026-07-23 11:46:42.000');

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

--
-- Dumping data for table `cart_items`
--

INSERT INTO `cart_items` (`id`, `userId`, `productId`, `quantity`, `createdAt`) VALUES
('cmrt28q749O6_Vxvt', 'user_admin_002', 'p01', 1, '2026-07-20 15:36:58.725'),
('cmrt28q7jFENRFWYq', 'user_admin_002', 'p02', 1, '2026-07-20 15:36:58.739');

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
('coup_first', 'NEELA10', 'Get 10% off on your first order', 'First Order Discount', 'PERCENTAGE', 10, 0, NULL, 1, 1, 1, 'FIRST_ORDER', NULL, NULL, NULL, 100, NULL, '2026-07-20 11:14:22.000'),
('coup_loyal10', 'SUPERFAN', '20% off + Free Shipping for super fans (10+ orders)', 'Super Fan Reward', 'PERCENTAGE', 20, 0, NULL, 0, 1, 0, 'LOYALTY', NULL, NULL, 10, 90, NULL, '2026-07-20 11:14:22.000'),
('coup_loyal3', 'LOYAL200', '₹200 off for loyal customers (3+ orders)', 'Loyalty Reward', 'FIXED', 200, 1500, NULL, 0, 1, 0, 'LOYALTY', NULL, NULL, 3, 80, NULL, '2026-07-20 11:14:22.000'),
('coup_loyal5', 'VIP15', '15% off for VIP customers (5+ orders)', 'VIP Exclusive', 'PERCENTAGE', 15, 0, NULL, 1, 1, 0, 'LOYALTY', NULL, NULL, 5, 85, NULL, '2026-07-20 11:14:22.000'),
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

--
-- Dumping data for table `coupon_usage`
--

INSERT INTO `coupon_usage` (`id`, `userId`, `couponId`, `orderId`, `usedAt`) VALUES
('cu_001', 'cust_priya', 'coup_002', 'ord_002', '2026-05-25 11:00:00.000'),
('cu_002', 'cust_kavitha', 'coup_t3000', 'ord_004', '2026-07-15 14:30:00.000'),
('cu_003', 'cust_anitha', 'coup_first', 'ord_005', '2026-07-18 16:00:00.000'),
('cu_004', 'cust_kavitha', 'coup_t10000', 'ord_009', '2026-03-10 10:00:00.000'),
('cu_005', 'cust_revathi', 'coup_loyal5', 'ord_010', '2026-06-15 08:00:00.000'),
('cu_006', 'cust_revathi', 'coup_t5000', 'ord_015', '2026-07-21 10:00:00.000');

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

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `userId`, `addressId`, `status`, `paymentStatus`, `paymentMethod`, `razorpayOrderId`, `razorpayPaymentId`, `subtotal`, `discount`, `couponCode`, `shippingCharge`, `total`, `trackingNumber`, `shippingPartnerId`, `estimatedDelivery`, `shippedAt`, `deliveredAt`, `notes`, `createdAt`, `updatedAt`) VALUES
('ord_001', 'cust_priya', 'addr_priya_1', 'DELIVERED', 'PAID', 'RAZORPAY', NULL, NULL, 2499, 0, NULL, 0, 2499, 'TRK10001IN', NULL, NULL, NULL, NULL, NULL, '2026-05-10 09:30:00.000', '2026-05-18 14:00:00.000'),
('ord_002', 'cust_priya', 'addr_priya_1', 'DELIVERED', 'PAID', 'RAZORPAY', NULL, NULL, 4998, 500, 'FLAT200', 0, 4498, 'TRK10002IN', NULL, NULL, NULL, NULL, NULL, '2026-05-25 11:00:00.000', '2026-06-02 16:30:00.000'),
('ord_003', 'cust_meena', 'addr_meena_1', 'SHIPPED', 'PAID', 'RAZORPAY', NULL, NULL, 3498, 0, NULL, 0, 3498, 'TRK10003IN', NULL, NULL, NULL, NULL, NULL, '2026-07-05 10:00:00.000', '2026-07-10 09:00:00.000'),
('ord_004', 'cust_kavitha', 'addr_kavitha_1', 'SHIPPED', 'PAID', 'RAZORPAY', NULL, NULL, 2298, 200, 'SAVE200', 0, 2098, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-15 14:30:00.000', '2026-07-23 12:11:08.000'),
('ord_005', 'cust_anitha', 'addr_anitha_1', 'CONFIRMED', 'PAID', 'RAZORPAY', NULL, NULL, 1099, 110, 'NEELA10', 0, 989, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-18 16:00:00.000', '2026-07-18 16:05:00.000'),
('ord_006', 'cust_sangeetha', 'addr_sangeetha_1', 'PENDING', 'PENDING', 'COD', NULL, NULL, 2199, 0, NULL, 0, 2199, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-22 11:30:00.000', '2026-07-22 11:30:00.000'),
('ord_007', 'cust_priya', 'addr_priya_2', 'CANCELLED', 'REFUNDED', 'RAZORPAY', NULL, NULL, 899, 0, NULL, 99, 998, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-01 09:00:00.000', '2026-06-02 10:00:00.000'),
('ord_008', 'cust_meena', 'addr_meena_2', 'RETURNED', 'REFUNDED', 'RAZORPAY', NULL, NULL, 1299, 0, NULL, 0, 1299, 'TRK10008IN', NULL, NULL, NULL, NULL, NULL, '2026-04-20 15:00:00.000', '2026-05-05 11:00:00.000'),
('ord_009', 'cust_kavitha', 'addr_kavitha_1', 'DELIVERED', 'PAID', 'RAZORPAY', NULL, NULL, 7498, 1000, 'ROYAL1000', 0, 6498, 'TRK10009IN', NULL, NULL, NULL, NULL, NULL, '2026-03-10 10:00:00.000', '2026-03-18 12:00:00.000'),
('ord_010', 'cust_revathi', 'addr_revathi_1', 'DELIVERED', 'PAID', 'RAZORPAY', NULL, NULL, 3999, 600, 'VIP15', 0, 3399, 'TRK10010IN', NULL, NULL, NULL, NULL, NULL, '2026-06-15 08:00:00.000', '2026-06-22 17:00:00.000'),
('ord_011', 'cust_revathi', 'addr_revathi_1', 'SHIPPED', 'PAID', 'RAZORPAY', NULL, NULL, 2199, 0, NULL, 0, 2199, 'TRK10011IN', NULL, NULL, NULL, NULL, NULL, '2026-07-12 10:30:00.000', '2026-07-15 09:00:00.000'),
('ord_012', 'cust_meena', 'addr_meena_1', 'DELIVERED', 'PAID', 'RAZORPAY', NULL, NULL, 1099, 0, NULL, 0, 1099, 'TRK10012IN', NULL, NULL, NULL, NULL, NULL, '2026-04-05 12:00:00.000', '2026-04-12 16:00:00.000'),
('ord_013', 'cust_priya', 'addr_priya_1', 'DELIVERED', 'PAID', 'RAZORPAY', NULL, NULL, 2199, 0, NULL, 0, 2199, 'TRK10013IN', NULL, NULL, NULL, NULL, NULL, '2026-06-20 08:30:00.000', '2026-06-28 14:00:00.000'),
('ord_014', 'cust_kavitha', 'addr_kavitha_1', 'CANCELLED', 'FAILED', 'RAZORPAY', NULL, NULL, 999, 0, NULL, 99, 1098, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-20 19:00:00.000', '2026-07-23 12:11:02.000'),
('ord_015', 'cust_revathi', 'addr_revathi_1', 'CONFIRMED', 'PAID', 'RAZORPAY', NULL, NULL, 5698, 500, 'MEGA500', 0, 5198, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-21 10:00:00.000', '2026-07-21 10:05:00.000');

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

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `comparePrice`, `sku`, `stock`, `images`, `fabric`, `occasion`, `color`, `blouseIncluded`, `careInstructions`, `isFeatured`, `isActive`, `categoryId`, `createdAt`, `updatedAt`) VALUES
('p01', 'Royal Magenta Banarasi Silk Saree', 'royal-magenta-banarasi-silk', 'Luxurious magenta Banarasi silk saree with heavy gold zari weaving throughout the body and pallu. Features traditional motifs and a rich border perfect for weddings.', 4999, 7999, 'NS-BAN-001', 15, '[\"https://res.cloudinary.com/dbzo38cdi/image/upload/v1784539709/neelas-sarees/dnzbiqz9oxvbognuztii.png\",\"https://res.cloudinary.com/dbzo38cdi/image/upload/v1784539709/neelas-sarees/c8dw9qycnkpwzcebyucn.png\",\"https://res.cloudinary.com/dbzo38cdi/image/upload/v1784539708/neelas-sarees/gr9yh6zmqbpvj5lk74kv.jpg\"]', 'Banarasi Silk', 'Wedding', 'Magenta', 1, 'Dry clean only. Store wrapped in muslin cloth.', 1, 1, 'cat_banarasi', '2026-07-20 14:24:51.000', '2026-07-20 14:59:43.000'),
('p02', 'Emerald Green Kanjivaram Pure Silk Saree', 'emerald-green-kanjivaram', 'Stunning emerald green Kanjivaram silk with contrast purple border and traditional peacock motifs woven in pure gold zari.', 5499, 9999, 'NS-KAN-001', 8, '[\"https://res.cloudinary.com/dbzo38cdi/image/upload/v1784539798/neelas-sarees/iqtdf2zaytry8gwst6at.png\",\"https://res.cloudinary.com/dbzo38cdi/image/upload/v1784539798/neelas-sarees/uttfjlip9khukmv7grrl.png\",\"https://res.cloudinary.com/dbzo38cdi/image/upload/v1784539797/neelas-sarees/zlwnx921v4qhsdzlp1ud.jpg\"]', 'Kanjivaram', 'Wedding', 'Green', 1, 'Dry clean only. Avoid direct sunlight.', 1, 1, 'cat_kanjivaram', '2026-07-20 14:24:51.000', '2026-07-20 15:00:02.000'),
('p03', 'Soft Pink Cotton Handloom Saree', 'soft-pink-cotton-handloom', 'Delicate soft pink handloom cotton saree with subtle self-stripe pattern and contrasting navy blue border. Ideal for daily wear.', 899, 1499, 'NS-COT-001', 40, '[\"https://res.cloudinary.com/dbzo38cdi/image/upload/v1784539818/neelas-sarees/v7alqg7pcaghsw8jm164.jpg\",\"https://res.cloudinary.com/dbzo38cdi/image/upload/v1784539819/neelas-sarees/mh5sfcxpqp4xzyczktyz.png\",\"https://res.cloudinary.com/dbzo38cdi/image/upload/v1784539820/neelas-sarees/if3bx9xdchh8wl7rnq9z.png\"]', 'Cotton', 'Daily', 'Pink', 0, 'Hand wash cold. Iron on medium heat.', 0, 1, 'cat_cotton', '2026-07-20 14:24:51.000', '2026-07-20 15:00:26.000'),
('p04', 'Navy Blue Linen Saree with Silver Zari', 'navy-blue-linen-silver-zari', 'Elegant navy blue linen saree with fine silver zari border. Lightweight and breathable, perfect for office and formal occasions.', 1299, 2499, 'NS-LIN-001', 25, '[\"https://res.cloudinary.com/dbzo38cdi/image/upload/v1784539839/neelas-sarees/ql1mi1r6pbuajias4kvs.jpg\",\"https://res.cloudinary.com/dbzo38cdi/image/upload/v1784539839/neelas-sarees/eeyhuorae43aycugl2ek.jpg\",\"https://res.cloudinary.com/dbzo38cdi/image/upload/v1784539839/neelas-sarees/wf1t07fgvsuhk93ck5ml.jpg\"]', 'Linen', 'Office', 'Navy Blue', 0, 'Hand wash cold. Iron while damp.', 0, 1, 'cat_linen', '2026-07-20 14:24:51.000', '2026-07-20 15:00:46.000'),
('p05', 'Peach Organza Saree with Floral Sequin Work', 'peach-organza-floral-sequin', 'Gorgeous peach organza saree with all-over floral sequin embroidery and scalloped border. A showstopper for parties.', 2799, 4999, 'NS-ORG-001', 12, '[]', 'Organza', 'Party', 'Peach', 0, 'Dry clean only. Handle with care.', 1, 1, 'cat_organza', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p06', 'Mustard Yellow Tussar Silk Saree', 'mustard-yellow-tussar-silk', 'Rich mustard yellow tussar silk with natural texture and contrast maroon border with tribal motifs.', 1999, 3499, 'NS-TUS-001', 18, '[]', 'Tussar Silk', 'Festive', 'Mustard Yellow', 1, 'Dry clean recommended. Iron on low heat.', 1, 1, 'cat_tussar', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p07', 'Red Bridal Banarasi Heavy Zari Saree', 'red-bridal-banarasi-heavy-zari', 'Traditional red Banarasi bridal saree with heavy gold zari work, intricate butta pattern, and grand pallu.', 6999, 12999, 'NS-BAN-002', 5, '[]', 'Banarasi Silk', 'Wedding', 'Red', 1, 'Dry clean only.', 1, 1, 'cat_banarasi', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p08', 'Sky Blue Chiffon Saree with Pearl Border', 'sky-blue-chiffon-pearl-border', 'Ethereal sky blue chiffon saree with delicate pearl-embellished border and matching sequin pallu.', 1899, 3299, 'NS-CHI-001', 20, '[]', 'Chiffon', 'Party', 'Sky Blue', 0, 'Dry clean only. Do not wring.', 0, 1, 'cat_new', '2026-07-20 14:24:51.000', '2026-07-23 11:48:57.000'),
('p09', 'Maroon Georgette Saree with Gold Print', 'maroon-georgette-gold-print', 'Elegant maroon georgette saree with all-over gold foil print and satin border. Lightweight and easy to drape.', 1499, 2799, 'NS-GEO-001', 30, '[]', 'Georgette', 'Festive', 'Maroon', 0, 'Hand wash gently. Iron on low.', 0, 1, 'cat_georgette', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p10', 'Ivory White Cotton Saree with Red Border', 'ivory-white-cotton-red-border', 'Classic ivory white cotton saree with bold red woven border. A timeless piece for casual and puja occasions.', 799, 1299, 'NS-COT-002', 50, '[]', 'Cotton', 'Casual', 'White', 0, 'Machine wash cold on gentle cycle.', 0, 1, 'cat_cotton', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p11', 'Deep Purple Kanjivaram Silk with Gold Checks', 'deep-purple-kanjivaram-gold-checks', 'Regal deep purple Kanjivaram silk saree with woven gold checks pattern and contrasting green pallu.', 4799, 8499, 'NS-KAN-002', 6, '[]', 'Kanjivaram', 'Festive', 'Purple', 1, 'Dry clean only.', 1, 1, 'cat_kanjivaram', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p12', 'Teal Green Organza Saree with Threadwork', 'teal-green-organza-threadwork', 'Beautiful teal green organza with intricate thread embroidery and beadwork along the border.', 2499, 4299, 'NS-ORG-002', 14, '[]', 'Organza', 'Party', 'Teal', 0, 'Dry clean only.', 0, 1, 'cat_organza', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p13', 'Beige Linen Saree with Kalamkari Print', 'beige-linen-kalamkari-print', 'Natural beige linen saree with authentic Kalamkari hand-painted border depicting mythological scenes.', 1599, 2999, 'NS-LIN-002', 22, '[]', 'Linen', 'Office', 'Beige', 0, 'Hand wash separately. Do not bleach.', 0, 1, 'cat_bestseller', '2026-07-20 14:24:51.000', '2026-07-23 11:49:12.000'),
('p14', 'Coral Chiffon Saree with Sequin Spray', 'coral-chiffon-sequin-spray', 'Vibrant coral chiffon with scattered sequin spray effect and matching crystal-embellished blouse piece.', 1799, 3199, 'NS-CHI-002', 16, '[]', 'Chiffon', 'Party', 'Coral', 1, 'Dry clean only.', 0, 1, 'cat_chiffon', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p15', 'Black and Gold Banarasi Silk Saree', 'black-gold-banarasi-silk', 'Dramatic black Banarasi silk with rich gold zari butta work throughout. Statement piece for receptions.', 5299, 9499, 'NS-BAN-003', 7, '[]', 'Banarasi Silk', 'Wedding', 'Black', 1, 'Dry clean only. Store in muslin.', 1, 1, 'cat_banarasi', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p16', 'Lavender Georgette Saree with Ruffle Border', 'lavender-georgette-ruffle-border', 'Trendy lavender georgette saree with stylish ruffle border and lightweight feel for modern occasions.', 1699, 2999, 'NS-GEO-002', 24, '[]', 'Georgette', 'Casual', 'Lavender', 0, 'Hand wash cold. Hang to dry.', 0, 1, 'cat_georgette', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p17', 'Golden Tussar Silk Saree with Kantha Stitch', 'golden-tussar-kantha-stitch', 'Natural golden tussar silk adorned with traditional Kantha hand-embroidery in multi-color thread.', 2299, 3999, 'NS-TUS-002', 10, '[]', 'Tussar Silk', 'Festive', 'Gold', 1, 'Dry clean recommended.', 1, 1, 'cat_tussar', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p18', 'Sea Green Cotton Saree with Temple Border', 'sea-green-cotton-temple-border', 'Fresh sea green cotton saree with traditional temple border in gold and maroon contrast.', 999, 1799, 'NS-COT-003', 35, '[]', 'Cotton', 'Daily', 'Sea Green', 0, 'Machine wash cold. Iron medium.', 0, 1, 'cat_cotton', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p19', 'Wine Red Pure Silk Saree with Brocade Pallu', 'wine-red-pure-silk-brocade', 'Luxurious wine red pure silk saree with heavy brocade pallu featuring paisley patterns in gold.', 3999, 6999, 'NS-SLK-001', 9, '[]', 'Pure Silk', 'Wedding', 'Wine Red', 1, 'Dry clean only.', 1, 1, 'cat_silk', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p20', 'Light Blue Patola Double Ikat Saree', 'light-blue-patola-double-ikat', 'Authentic light blue Patola double ikat saree handwoven in Patan, Gujarat with geometric patterns.', 4499, 7999, 'NS-PAT-001', 5, '[]', 'Patola', 'Festive', 'Light Blue', 1, 'Dry clean only. Store flat.', 1, 1, 'cat_patola', '2026-07-20 14:24:51.000', '2026-07-23 11:46:42.603'),
('p21', 'Powder Pink Organza Saree with Mirror Work', 'powder-pink-organza-mirror-work', 'Dreamy powder pink organza saree embellished with mirror work and delicate zardozi border.', 2899, 4999, 'NS-ORG-003', 11, '[]', 'Organza', 'Party', 'Powder Pink', 0, 'Dry clean only.', 0, 1, 'cat_organza', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p22', 'Charcoal Grey Linen Saree with Silver Border', 'charcoal-grey-linen-silver-border', 'Sophisticated charcoal grey linen saree with subtle silver zari border. Perfect for formal occasions.', 1399, 2599, 'NS-LIN-003', 28, '[]', 'Linen', 'Office', 'Charcoal Grey', 0, 'Hand wash cold. Iron while damp.', 0, 1, 'cat_linen', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p23', 'Bright Yellow Cotton Saree with Ikat Print', 'bright-yellow-cotton-ikat-print', 'Cheerful bright yellow cotton saree with bold ikat print pattern and contrast black border.', 849, 1399, 'NS-COT-004', 45, '[]', 'Cotton', 'Casual', 'Yellow', 0, 'Machine wash cold. Do not bleach.', 0, 1, 'cat_cotton', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p24', 'Royal Blue Chiffon Saree with Stone Work', 'royal-blue-chiffon-stone-work', 'Stunning royal blue chiffon with kundan and stone work along the border and pallu.', 2099, 3799, 'NS-CHI-003', 13, '[]', 'Chiffon', 'Party', 'Royal Blue', 0, 'Dry clean only.', 0, 1, 'cat_chiffon', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p25', 'Olive Green Georgette Printed Saree', 'olive-green-georgette-printed', 'Trendy olive green georgette saree with abstract digital print and satin silk border.', 1399, 2499, 'NS-GEO-003', 32, '[]', 'Georgette', 'Casual', 'Olive Green', 0, 'Hand wash gently. Iron low.', 0, 1, 'cat_georgette', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p26', 'Crimson Red Kanjivaram Bridal Saree', 'crimson-red-kanjivaram-bridal', 'Exquisite crimson red Kanjivaram silk bridal saree with heavy gold zari and traditional temple border design.', 6499, 11999, 'NS-KAN-003', 5, '[]', 'Kanjivaram', 'Wedding', 'Crimson Red', 1, 'Dry clean only.', 1, 1, 'cat_kanjivaram', '2026-07-20 14:24:51.000', '2026-07-23 11:46:42.603'),
('p27', 'Mint Green Tussar Silk with Madhubani Print', 'mint-green-tussar-madhubani', 'Unique mint green tussar silk saree featuring hand-painted Madhubani art border with fish and floral motifs.', 2599, 4499, 'NS-TUS-003', 9, '[]', 'Tussar Silk', 'Festive', 'Mint Green', 0, 'Dry clean only. Handle gently.', 0, 1, 'cat_tussar', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p28', 'Off-White Banarasi Silk with Meenakari Work', 'off-white-banarasi-meenakari', 'Elegant off-white Banarasi silk saree with intricate meenakari work in multiple colors on the border and pallu.', 5799, 9999, 'NS-BAN-004', 6, '[]', 'Banarasi Silk', 'Wedding', 'Off-White', 1, 'Dry clean only.', 1, 1, 'cat_banarasi', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p29', 'Rust Orange Cotton Saree with Ajrakh Print', 'rust-orange-cotton-ajrakh', 'Earthy rust orange cotton saree with hand-block Ajrakh print in indigo and white geometric patterns.', 1099, 1999, 'NS-COT-005', 30, '[]', 'Cotton', 'Casual', 'Rust Orange', 0, 'Hand wash cold separately. Iron medium.', 0, 1, 'cat_cotton', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p30', 'Rani Pink Georgette Saree with Gota Patti', 'rani-pink-georgette-gota-patti', 'Vibrant rani pink georgette saree with traditional Rajasthani gota patti work along the border and pallu.', 1999, 3499, 'NS-GEO-004', 18, '[]', 'Georgette', 'Festive', 'Rani Pink', 1, 'Dry clean only.', 1, 1, 'cat_georgette', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p31', 'Forest Green Pure Silk Handloom Saree', 'forest-green-pure-silk-handloom', 'Rich forest green pure silk handloom saree with copper zari border and classic butis throughout.', 3499, 5999, 'NS-SLK-002', 8, '[]', 'Pure Silk', 'Festive', 'Forest Green', 1, 'Dry clean only.', 0, 1, 'cat_silk', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p32', 'Pastel Lilac Organza Saree with 3D Flowers', 'pastel-lilac-organza-3d-flowers', 'Romantic pastel lilac organza saree embellished with 3D fabric flowers and pearl detailing.', 3199, 5499, 'NS-ORG-004', 7, '[]', 'Organza', 'Party', 'Lilac', 0, 'Dry clean only. Store flat.', 0, 1, 'cat_organza', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p33', 'Steel Grey Linen Saree with Copper Zari', 'steel-grey-linen-copper-zari', 'Modern steel grey linen saree with warm copper zari stripes and matching blouse piece.', 1499, 2799, 'NS-LIN-004', 20, '[]', 'Linen', 'Office', 'Steel Grey', 1, 'Hand wash. Iron damp.', 0, 1, 'cat_linen', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p34', 'Hot Pink Chiffon Saree with Lace Border', 'hot-pink-chiffon-lace-border', 'Eye-catching hot pink chiffon saree with French lace border and delicate pearl edging.', 1599, 2899, 'NS-CHI-004', 22, '[]', 'Chiffon', 'Casual', 'Hot Pink', 0, 'Dry clean only.', 0, 1, 'cat_chiffon', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p35', 'Red and Green Patola Ikat Saree', 'red-green-patola-ikat', 'Traditional red and green Patola ikat saree with geometric diamond patterns handwoven over weeks.', 4999, 8999, 'NS-PAT-002', 5, '[]', 'Patola', 'Wedding', 'Red-Green', 1, 'Dry clean only.', 1, 1, 'cat_patola', '2026-07-20 14:24:51.000', '2026-07-23 11:46:42.603'),
('p36', 'Butter Yellow Banarasi Silk Saree', 'butter-yellow-banarasi-silk', 'Delightful butter yellow Banarasi silk with fine gold zari bootis and rich peacock pallu.', 4299, 7499, 'NS-BAN-005', 10, '[]', 'Banarasi Silk', 'Festive', 'Butter Yellow', 1, 'Dry clean only.', 1, 1, 'cat_banarasi', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p37', 'Indigo Blue Cotton Saree with Dabu Print', 'indigo-blue-cotton-dabu-print', 'Deep indigo cotton saree with traditional Dabu (mud resist) printing in white floral patterns.', 999, 1699, 'NS-COT-006', 38, '[]', 'Cotton', 'Daily', 'Indigo Blue', 0, 'Hand wash separately. Colors may bleed initially.', 0, 1, 'cat_cotton', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p38', 'Champagne Gold Organza Saree with Cutdana', 'champagne-gold-organza-cutdana', 'Glamorous champagne gold organza saree with heavy cutdana and sequin embroidery for reception wear.', 3499, 5999, 'NS-ORG-005', 6, '[]', 'Organza', 'Wedding', 'Champagne Gold', 1, 'Dry clean only.', 1, 1, 'cat_organza', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p39', 'Sage Green Georgette Saree with Floral Print', 'sage-green-georgette-floral', 'Fresh sage green georgette with all-over watercolor floral print and contrasting pink border.', 1299, 2299, 'NS-GEO-005', 26, '[]', 'Georgette', 'Casual', 'Sage Green', 0, 'Hand wash cold. Iron low.', 0, 1, 'cat_georgette', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p40', 'Midnight Blue Kanjivaram Silk Saree', 'midnight-blue-kanjivaram-silk', 'Majestic midnight blue Kanjivaram silk with rich gold and copper dual-tone zari and checks pattern.', 5199, 9499, 'NS-KAN-004', 5, '[]', 'Kanjivaram', 'Festive', 'Midnight Blue', 1, 'Dry clean only.', 1, 1, 'cat_kanjivaram', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p41', 'Peach Pink Cotton Saree with Applique Work', 'peach-pink-cotton-applique', 'Sweet peach pink cotton saree with hand-applique floral patches and contrasting piping.', 1199, 2199, 'NS-COT-007', 28, '[]', 'Cotton', 'Casual', 'Peach Pink', 0, 'Hand wash cold. Iron medium.', 0, 1, 'cat_cotton', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p42', 'Turquoise Chiffon Saree with Swarovski Border', 'turquoise-chiffon-swarovski', 'Stunning turquoise chiffon saree with genuine Swarovski crystal border and matching blouse.', 2499, 4299, 'NS-CHI-005', 10, '[]', 'Chiffon', 'Party', 'Turquoise', 1, 'Dry clean only.', 0, 1, 'cat_chiffon', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p43', 'Burnt Sienna Tussar Silk with Batik Print', 'burnt-sienna-tussar-batik', 'Warm burnt sienna tussar silk saree with wax-resist batik patterns in earthy tones.', 1899, 3299, 'NS-TUS-004', 14, '[]', 'Tussar Silk', 'Office', 'Burnt Sienna', 0, 'Dry clean recommended.', 0, 1, 'cat_tussar', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p44', 'Blush Pink Pure Silk Saree with Pearl Work', 'blush-pink-pure-silk-pearl', 'Romantic blush pink pure silk saree with delicate pearl embellishment along border and pallu edge.', 3799, 6499, 'NS-SLK-003', 7, '[]', 'Pure Silk', 'Party', 'Blush Pink', 1, 'Dry clean only.', 0, 1, 'cat_silk', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p45', 'Dark Teal Linen Saree with Gold Thread Border', 'dark-teal-linen-gold-thread', 'Sophisticated dark teal linen saree with rich gold thread woven border. Ideal for formal events.', 1599, 2899, 'NS-LIN-005', 19, '[]', 'Linen', 'Office', 'Dark Teal', 0, 'Hand wash. Iron while slightly damp.', 0, 1, 'cat_linen', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p46', 'Tangerine Orange Georgette Bandhani Saree', 'tangerine-georgette-bandhani', 'Lively tangerine orange georgette with authentic tie-dye Bandhani pattern and golden lace trim.', 1599, 2799, 'NS-GEO-006', 21, '[]', 'Georgette', 'Festive', 'Tangerine Orange', 0, 'Hand wash cold. Do not wring.', 0, 1, 'cat_georgette', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p47', 'Sapphire Blue Banarasi Silk Saree', 'sapphire-blue-banarasi-silk', 'Royal sapphire blue Banarasi silk saree with heavy kadwa weave and traditional jaal pattern in gold zari.', 5599, 9999, 'NS-BAN-006', 5, '[]', 'Banarasi Silk', 'Wedding', 'Sapphire Blue', 1, 'Dry clean only.', 1, 1, 'cat_banarasi', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p48', 'White Cotton Saree with Black Block Print', 'white-cotton-black-block-print', 'Crisp white cotton saree with bold black hand-block print in contemporary geometric design.', 899, 1599, 'NS-COT-008', 42, '[]', 'Cotton', 'Office', 'White-Black', 0, 'Machine wash cold. Iron medium.', 0, 1, 'cat_cotton', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p49', 'Magenta Patola Silk Saree', 'magenta-patola-silk', 'Vibrant magenta Patola silk saree with signature diamond and parrot motifs in contrasting colors.', 4699, 8499, 'NS-PAT-003', 5, '[]', 'Patola', 'Festive', 'Magenta', 1, 'Dry clean only.', 1, 1, 'cat_patola', '2026-07-20 14:24:51.000', '2026-07-23 11:46:42.603'),
('p50', 'Dusty Rose Organza Saree with Zardozi', 'dusty-rose-organza-zardozi', 'Elegant dusty rose organza saree with heavy zardozi hand-embroidery on border and pallu. Perfect for engagement.', 3299, 5799, 'NS-ORG-006', 8, '[]', 'Organza', 'Wedding', 'Dusty Rose', 1, 'Dry clean only. Handle with utmost care.', 1, 1, 'cat_organza', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p51', 'Bottle Green Kanjivaram with Mango Motif', 'bottle-green-kanjivaram-mango', 'Traditional bottle green Kanjivaram silk with classic mango (paisley) butta and rich contrast pallu.', 4899, 8999, 'NS-KAN-005', 6, '[]', 'Kanjivaram', 'Wedding', 'Bottle Green', 1, 'Dry clean only.', 1, 1, 'cat_kanjivaram', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p52', 'Cream Tussar Silk Saree with Warli Print', 'cream-tussar-warli-print', 'Natural cream tussar silk saree with hand-painted Warli tribal art motifs depicting village life.', 2199, 3799, 'NS-TUS-005', 11, '[]', 'Tussar Silk', 'Casual', 'Cream', 0, 'Dry clean recommended. Avoid water.', 0, 1, 'cat_tussar', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p53', 'Electric Blue Chiffon Saree with Pleated Pallu', 'electric-blue-chiffon-pleated', 'Modern electric blue chiffon with pre-pleated pallu and crystal-studded border for hassle-free draping.', 1899, 3399, 'NS-CHI-006', 15, '[]', 'Chiffon', 'Party', 'Electric Blue', 0, 'Dry clean only.', 0, 1, 'cat_chiffon', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p54', 'Terracotta Linen Saree with Hand Embroidery', 'terracotta-linen-hand-embroidery', 'Earthy terracotta linen saree with hand chain-stitch embroidery in cream thread along the border.', 1699, 2999, 'NS-LIN-006', 17, '[]', 'Linen', 'Casual', 'Terracotta', 0, 'Hand wash gently. Iron while damp.', 0, 1, 'cat_linen', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p55', 'Plum Purple Pure Silk Saree with Kundan', 'plum-purple-pure-silk-kundan', 'Rich plum purple pure silk with kundan stone embellishment and heavy gold zari weaving. Reception ready.', 4199, 7499, 'NS-SLK-004', 5, '[]', 'Pure Silk', 'Wedding', 'Plum Purple', 1, 'Dry clean only.', 1, 1, 'cat_silk', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p56', 'Fuchsia Pink Banarasi Silk with Cutwork', 'fuchsia-pink-banarasi-cutwork', 'Striking fuchsia pink Banarasi silk saree with delicate cutwork border and antique gold zari.', 4599, 7999, 'NS-BAN-007', 8, '[]', 'Banarasi Silk', 'Festive', 'Fuchsia Pink', 0, 'Dry clean only.', 0, 1, 'cat_banarasi', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p57', 'Ash Grey Cotton Saree with Shibori Dye', 'ash-grey-cotton-shibori', 'Contemporary ash grey cotton saree with Japanese Shibori tie-dye technique creating organic patterns.', 1099, 1999, 'NS-COT-009', 33, '[]', 'Cotton', 'Office', 'Ash Grey', 0, 'Hand wash cold separately.', 0, 1, 'cat_cotton', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p58', 'Vermilion Red Georgette Saree with Sequin Pallu', 'vermilion-red-georgette-sequin', 'Bold vermilion red georgette saree with full sequin-covered pallu and satin silk border.', 1799, 3199, 'NS-GEO-007', 19, '[]', 'Georgette', 'Party', 'Vermilion Red', 0, 'Dry clean only.', 0, 1, 'cat_georgette', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('p59', 'Aqua Blue Kanjivaram Silk with Peacock Border', 'aqua-blue-kanjivaram-peacock', 'Refreshing aqua blue Kanjivaram silk saree with intricate peacock border motifs in gold and magenta zari.', 5699, 10499, 'NS-KAN-006', 5, '[]', 'Kanjivaram', 'Festive', 'Aqua Blue', 1, 'Dry clean only.', 1, 1, 'cat_kanjivaram', '2026-07-20 14:24:51.000', '2026-07-23 11:46:42.603'),
('p60', 'Sand Beige Organza Saree with Resham Thread', 'sand-beige-organza-resham', 'Graceful sand beige organza saree with dense resham thread embroidery in floral vine pattern.', 2699, 4699, 'NS-ORG-007', 10, '[]', 'Organza', 'Party', 'Sand Beige', 0, 'Dry clean only.', 0, 1, 'cat_organza', '2026-07-20 14:24:51.000', '2026-07-20 14:24:51.000'),
('prod_100', 'Mint Green Cotton Saree with Kalamkari Print', 'mint-green-cotton-kalamkari', 'A refreshing mint green cotton saree featuring traditional Kalamkari hand-painted motifs inspired by ancient temple art. Soft and breathable, perfect for summer days and casual outings.', 1199, 2499, 'SKU-100', 22, '[\"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80\"]', 'Cotton', 'Casual', 'Green', 0, 'Hand wash in cold water. Do not bleach. Iron on medium heat.', 0, 1, 'cat_cotton', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_101', 'Mustard Yellow Cotton Ikat Saree', 'mustard-yellow-cotton-ikat', 'A vibrant mustard yellow cotton saree with authentic Ikat weave patterns from Pochampally. The geometric designs create a bold, contemporary look while maintaining traditional roots.', 1349, 2799, 'SKU-101', 15, '[\"https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80\"]', 'Cotton', 'Office', 'Yellow', 0, 'Hand wash separately in cold water. Dry in shade.', 0, 1, 'cat_cotton', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_102', 'White Cotton Saree with Red Temple Border', 'white-cotton-red-temple-border', 'An elegant white cotton saree with a striking red temple border. The classic combination is timeless and versatile, suitable for both daily wear and casual functions.', 899, 1999, 'SKU-102', 35, '[\"https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80\"]', 'Cotton', 'Daily', 'White', 0, 'Machine wash cold on gentle cycle. Do not bleach.', 1, 1, 'cat_cotton', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_103', 'Teal Blue Cotton Handloom Saree', 'teal-blue-cotton-handloom', 'A beautiful teal blue handloom cotton saree woven by artisans from West Bengal. Features subtle self-stripe patterns and a contrasting gold-thread border. Perfect for office wear.', 1449, 2999, 'SKU-103', 18, '[\"https://images.unsplash.com/photo-1564459031891-f5e6b3fb79de?w=600&q=80\"]', 'Cotton', 'Office', 'Teal', 0, 'Hand wash in cold water. Iron while slightly damp.', 0, 1, 'cat_cotton', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_104', 'Peach Cotton Saree with Jamdani Weave', 'peach-cotton-jamdani-weave', 'A delicate peach cotton saree featuring intricate Jamdani weave motifs of flowers and paisleys. This Bengal handloom masterpiece is incredibly lightweight and comfortable.', 1599, 3499, 'SKU-104', 12, '[\"https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80\"]', 'Cotton', 'Festive', 'Peach', 0, 'Dry clean recommended for first wash. Then gentle hand wash.', 1, 1, 'cat_cotton', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_105', 'Navy Blue Cotton Saree with Silver Zari', 'navy-blue-cotton-silver-zari', 'A sophisticated navy blue cotton saree adorned with silver zari border and pallu. The deep colour and metallic sheen make it perfect for evening events and semi-formal gatherings.', 1299, 2699, 'SKU-105', 20, '[\"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80\"]', 'Cotton', 'Party', 'Navy Blue', 0, 'Hand wash in cold water separately. Iron on low heat.', 0, 1, 'cat_cotton', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_106', 'Olive Green Cotton Mangalgiri Saree', 'olive-green-cotton-mangalgiri', 'An earthy olive green Mangalgiri cotton saree with characteristic Nizam border in gold. Handwoven in Andhra Pradesh, known for its durability and rich texture.', 1149, 2399, 'SKU-106', 28, '[\"https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80\"]', 'Cotton', 'Office', 'Olive Green', 0, 'Machine wash cold. Iron on medium heat.', 0, 1, 'cat_cotton', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_107', 'Rust Orange Cotton Saree with Block Print', 'rust-orange-cotton-block-print', 'A warm rust orange cotton saree with traditional hand block printing from Jaipur. The earthy terracotta tones with indigo accents create a stunning ethnic look.', 999, 2199, 'SKU-107', 25, '[\"https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80\"]', 'Cotton', 'Daily', 'Orange', 0, 'Hand wash in cold water. Colours may bleed on first wash.', 0, 1, 'cat_cotton', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_108', 'Lavender Cotton Saree with Tant Weave', 'lavender-cotton-tant-weave', 'A soft lavender Bengal Tant cotton saree with delicate jamdani-inspired floral motifs. Known for its lightweight feel and beautiful drape, ideal for Bengali occasions.', 1399, 2899, 'SKU-108', 14, '[\"https://images.unsplash.com/photo-1564459031891-f5e6b3fb79de?w=600&q=80\"]', 'Cotton', 'Festive', 'Lavender', 0, 'Gentle hand wash. Do not wring. Dry flat in shade.', 0, 1, 'cat_cotton', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_109', 'Burgundy Cotton Saree with Ajrakh Print', 'burgundy-cotton-ajrakh', 'A rich burgundy cotton saree with authentic Ajrakh block print from Kutch, Gujarat. The natural dyes and geometric patterns tell a story of centuries-old craftsmanship.', 1249, 2699, 'SKU-109', 16, '[\"https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80\"]', 'Cotton', 'Casual', 'Burgundy', 0, 'Hand wash in cold water. Natural dyes may fade slightly with washes.', 0, 1, 'cat_cotton', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_110', 'Cream Cotton Saree with Madhubani Art', 'cream-cotton-madhubani-art', 'A pristine cream cotton saree hand-painted with vibrant Madhubani art motifs depicting nature and mythology. Each saree is a unique piece of wearable art from Bihar.', 1699, 3499, 'SKU-110', 8, '[\"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80\"]', 'Cotton', 'Festive', 'Cream', 0, 'Dry clean only to preserve hand-painted art.', 1, 1, 'cat_cotton', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_111', 'Black Cotton Saree with White Polka Dots', 'black-cotton-white-polka', 'A chic black cotton saree with playful white polka dots. Modern yet traditional, this saree is perfect for the fashion-forward woman who loves minimalist style.', 849, 1899, 'SKU-111', 30, '[\"https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80\"]', 'Cotton', 'Party', 'Black', 0, 'Machine wash cold inside out. Tumble dry low.', 0, 1, 'cat_cotton', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_112', 'Sky Blue Cotton Saree with Shibori Tie-Dye', 'sky-blue-cotton-shibori', 'A breezy sky blue cotton saree with Japanese-inspired Shibori tie-dye technique creating beautiful organic patterns. Light and airy, perfect for coastal getaways.', 1099, 2299, 'SKU-112', 20, '[\"https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80\"]', 'Cotton', 'Casual', 'Sky Blue', 0, 'Hand wash in cold water. Each piece has unique dye patterns.', 0, 1, 'cat_cotton', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_113', 'Forest Green Cotton Saree with Kasuti Embroidery', 'forest-green-cotton-kasuti', 'A deep forest green cotton saree with delicate Kasuti embroidery from Karnataka. The intricate running-stitch patterns of temple architecture and nature are mesmerising.', 1549, 3199, 'SKU-113', 10, '[\"https://images.unsplash.com/photo-1564459031891-f5e6b3fb79de?w=600&q=80\"]', 'Cotton', 'Festive', 'Green', 1, 'Dry clean recommended. Handle embroidery with care.', 0, 1, 'cat_cotton', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_114', 'Magenta Cotton Saree with Chikankari Work', 'magenta-cotton-chikankari', 'A vibrant magenta cotton saree with exquisite Lucknowi Chikankari hand embroidery. The white thread work on the bright base creates a stunning visual contrast.', 1399, 2899, 'SKU-114', 15, '[\"https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80\"]', 'Cotton', 'Party', 'Magenta', 0, 'Hand wash inside out. Iron on reverse side.', 0, 1, 'cat_cotton', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_115', 'Sage Green Cotton Saree with Warli Print', 'sage-green-cotton-warli', 'A calming sage green cotton saree with tribal Warli art print depicting village life scenes. This unique saree celebrates the folk art tradition of Maharashtra.', 1049, 2199, 'SKU-115', 22, '[\"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80\"]', 'Cotton', 'Daily', 'Green', 0, 'Machine wash cold on gentle cycle. Iron while damp.', 0, 1, 'cat_cotton', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_116', 'Powder Pink Cotton Saree with Gota Patti', 'powder-pink-cotton-gota-patti', 'A delicate powder pink cotton saree embellished with Rajasthani Gota Patti work on the border and pallu. The golden gota adds festive charm to the soft cotton base.', 1499, 3199, 'SKU-116', 12, '[\"https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80\"]', 'Cotton', 'Wedding', 'Pink', 1, 'Dry clean only. Do not iron directly on gota work.', 0, 1, 'cat_cotton', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_117', 'Charcoal Grey Cotton Saree with Silver Checks', 'charcoal-grey-cotton-silver-checks', 'A modern charcoal grey cotton saree with subtle silver lurex checks throughout. Minimalist and sophisticated, perfect for corporate events and formal gatherings.', 1199, 2499, 'SKU-117', 20, '[\"https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80\"]', 'Cotton', 'Office', 'Grey', 0, 'Machine wash cold. Dry flat to maintain shape.', 0, 1, 'cat_cotton', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_118', 'Royal Purple Banarasi Silk with Meenakari', 'royal-purple-banarasi-meenakari', 'A regal royal purple Banarasi silk saree with exquisite Meenakari work in gold and multicolour. The fine artistry showcases floral motifs that shimmer with every movement.', 4299, 8999, 'SKU-118', 6, '[\"https://images.unsplash.com/photo-1594938298603-c8148c4b4283?w=600&q=80\"]', 'Banarasi Silk', 'Wedding', 'Purple', 1, 'Dry clean only. Store wrapped in muslin cloth.', 1, 1, 'cat_banarasi', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_119', 'Emerald Green Banarasi Silk Jangla Saree', 'emerald-green-banarasi-jangla', 'An opulent emerald green Banarasi silk saree with all-over Jangla weave pattern. The dense floral and leaf motifs in gold zari create a rich, carpet-like texture.', 5499, 11999, 'SKU-119', 4, '[\"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80\"]', 'Banarasi Silk', 'Wedding', 'Green', 1, 'Dry clean only. Avoid folding on zari lines.', 1, 1, 'cat_banarasi', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_120', 'Peach Pink Banarasi Silk with Cutwork Border', 'peach-pink-banarasi-cutwork', 'A romantic peach pink Banarasi silk saree with intricate cutwork border design. The delicate openwork pattern on the border adds a modern twist to this traditional weave.', 3799, 7999, 'SKU-120', 8, '[\"https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80\"]', 'Banarasi Silk', 'Festive', 'Peach', 1, 'Dry clean only. Handle with care near cutwork areas.', 0, 1, 'cat_banarasi', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_121', 'Midnight Blue Banarasi with Tanchoi Weave', 'midnight-blue-banarasi-tanchoi', 'A luxurious midnight blue Banarasi silk saree with Tanchoi weave featuring geometric and floral patterns. The satin finish and single-warp technique create a subtle, elegant sheen.', 3999, 8499, 'SKU-121', 7, '[\"https://images.unsplash.com/photo-1564459031891-f5e6b3fb79de?w=600&q=80\"]', 'Banarasi Silk', 'Party', 'Blue', 1, 'Dry clean only. Store flat, not hanging.', 0, 1, 'cat_banarasi', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_122', 'Crimson Red Banarasi Silk Bridal Saree', 'crimson-red-banarasi-bridal', 'The quintessential bridal saree — a crimson red Banarasi silk with heavy gold zari work throughout. Features traditional bel and jhal motifs on a rich kadhua weave. A wedding masterpiece.', 6999, 14999, 'SKU-122', 3, '[\"https://images.unsplash.com/photo-1594938298603-c8148c4b4283?w=600&q=80\"]', 'Banarasi Silk', 'Wedding', 'Red', 1, 'Professional dry clean only. Store in acid-free tissue.', 1, 1, 'cat_banarasi', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_123', 'Ivory White Banarasi Silk with Gold Brocade', 'ivory-white-banarasi-gold-brocade', 'An ethereal ivory white Banarasi silk saree with all-over gold brocade work. The pristine white base with rich gold creates a look of understated luxury, perfect for receptions.', 4999, 9999, 'SKU-123', 5, '[\"https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80\"]', 'Banarasi Silk', 'Wedding', 'White', 1, 'Dry clean only. Avoid perfume sprays directly on fabric.', 1, 1, 'cat_banarasi', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_124', 'Magenta Banarasi Silk with Kadhwa Booti', 'magenta-banarasi-kadhwa-booti', 'A vivid magenta Banarasi silk saree with Kadhwa booti technique — each motif woven individually with separate threads, creating raised patterns that feel almost 3D.', 4599, 9499, 'SKU-124', 6, '[\"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80\"]', 'Banarasi Silk', 'Festive', 'Magenta', 1, 'Dry clean only. Never iron directly on zari.', 0, 1, 'cat_banarasi', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_125', 'Turquoise Banarasi Silk with Silver Zari', 'turquoise-banarasi-silver-zari', 'A refreshing turquoise Banarasi silk saree with silver zari weaving instead of the traditional gold. The cool-toned combination is perfect for modern celebrations and sangeet ceremonies.', 3699, 7999, 'SKU-125', 9, '[\"https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80\"]', 'Banarasi Silk', 'Party', 'Turquoise', 1, 'Dry clean only. Store away from direct sunlight.', 0, 1, 'cat_banarasi', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_126', 'Wine Red Banarasi Silk Saree with Mughal Motifs', 'wine-red-banarasi-mughal', 'A sophisticated wine red Banarasi silk saree adorned with Mughal-inspired motifs — jali patterns, paisley, and royal emblems woven in antique gold zari.', 4899, 9999, 'SKU-126', 4, '[\"https://images.unsplash.com/photo-1594938298603-c8148c4b4283?w=600&q=80\"]', 'Banarasi Silk', 'Wedding', 'Wine', 1, 'Dry clean only. Air out occasionally to prevent mustiness.', 0, 1, 'cat_banarasi', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_127', 'Dusty Rose Banarasi Silk with Phulkari Border', 'dusty-rose-banarasi-phulkari', 'A romantic dusty rose Banarasi silk saree with a vibrant Phulkari-inspired border. The fusion of Varanasi weaving with Punjabi embroidery aesthetics creates a uniquely modern piece.', 3499, 6999, 'SKU-127', 10, '[\"https://images.unsplash.com/photo-1564459031891-f5e6b3fb79de?w=600&q=80\"]', 'Banarasi Silk', 'Festive', 'Pink', 1, 'Dry clean recommended. Handle border with care.', 0, 1, 'cat_banarasi', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_128', 'Champagne Gold Banarasi Tissue Silk', 'champagne-gold-banarasi-tissue', 'A glamorous champagne gold Banarasi tissue silk saree with self-coloured zari throughout. The translucent tissue gives it an ethereal glow, making it ideal for cocktail parties.', 3299, 6499, 'SKU-128', 11, '[\"https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80\"]', 'Banarasi Silk', 'Party', 'Gold', 0, 'Dry clean only. Tissue silk is delicate — avoid pulling.', 0, 1, 'cat_banarasi', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_129', 'Forest Green Banarasi Silk with Resham Work', 'forest-green-banarasi-resham', 'A rich forest green Banarasi silk saree with colourful resham (silk thread) embroidery creating floral vines and peacock motifs. A vibrant choice for Mehendi ceremonies.', 3899, 7999, 'SKU-129', 7, '[\"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80\"]', 'Banarasi Silk', 'Wedding', 'Green', 1, 'Dry clean only. Store rolled, not folded.', 0, 1, 'cat_banarasi', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_130', 'Coral Banarasi Silk with Butidar Pattern', 'coral-banarasi-butidar', 'A cheerful coral Banarasi silk saree with evenly spaced butidar (small buti) motifs in gold zari. The understated elegance makes it versatile for both day and evening events.', 2999, 5999, 'SKU-130', 13, '[\"https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80\"]', 'Banarasi Silk', 'Festive', 'Coral', 1, 'Dry clean only. Iron on reverse with cloth barrier.', 0, 1, 'cat_banarasi', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_131', 'Black Banarasi Silk with Gold Jaal', 'black-banarasi-gold-jaal', 'A dramatic black Banarasi silk saree with all-over gold jaal (net) pattern. The contrast of black silk with rich gold zari creates a statement piece for formal evening events.', 4199, 8499, 'SKU-131', 6, '[\"https://images.unsplash.com/photo-1594938298603-c8148c4b4283?w=600&q=80\"]', 'Banarasi Silk', 'Party', 'Black', 1, 'Dry clean only. Store in breathable garment bag.', 1, 1, 'cat_banarasi', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_132', 'Rani Pink Banarasi Silk with Katan Weave', 'rani-pink-banarasi-katan', 'A traditional rani pink Banarasi katan silk saree — the purest form of Banarasi weave using twisted threads. Features classic bel border and intricate pallu work in gold.', 5199, 10999, 'SKU-132', 4, '[\"https://images.unsplash.com/photo-1564459031891-f5e6b3fb79de?w=600&q=80\"]', 'Banarasi Silk', 'Wedding', 'Pink', 1, 'Professional dry clean only. Premium silk — handle with care.', 0, 1, 'cat_banarasi', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_133', 'Teal Banarasi Silk Saree with Paithani Border', 'teal-banarasi-paithani-border', 'A unique fusion saree combining Banarasi silk body with Paithani-style peacock border from Maharashtra. Teal base with multicolour pallu creating an art piece of two weaving traditions.', 4699, 9499, 'SKU-133', 5, '[\"https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80\"]', 'Banarasi Silk', 'Festive', 'Teal', 1, 'Dry clean only. This is a collector piece — store carefully.', 0, 1, 'cat_banarasi', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_134', 'Lavender Banarasi Silk with Jangla Pallu', 'lavender-banarasi-jangla-pallu', 'A graceful lavender Banarasi silk saree with a heavily worked Jangla pallu. The body features scattered bootis while the pallu showcases dense floral jaal work in gold.', 3599, 7499, 'SKU-134', 8, '[\"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80\"]', 'Banarasi Silk', 'Party', 'Lavender', 1, 'Dry clean only. Avoid spraying perfume directly.', 0, 1, 'cat_banarasi', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_135', 'Olive Green Banarasi Silk with Tissue Pallu', 'olive-green-banarasi-tissue-pallu', 'An elegant olive green Banarasi silk saree with a contrasting tissue silk pallu in gold. The dual-tone effect adds dimension and drama to this sophisticated piece.', 3399, 6999, 'SKU-135', 9, '[\"https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80\"]', 'Banarasi Silk', 'Festive', 'Olive', 1, 'Dry clean only. Handle tissue pallu with extra care.', 0, 1, 'cat_banarasi', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_136', 'Traditional Red Kanjivaram with Peacock Motifs', 'red-kanjivaram-peacock-motifs', 'A classic red Kanjivaram silk saree with traditional peacock motifs woven in contrasting green and gold zari. The quintessential South Indian bridal saree.', 5999, 12999, 'SKU-136', 4, '[\"https://images.unsplash.com/photo-1594938298603-c8148c4b4283?w=600&q=80\"]', 'Kanjivaram', 'Wedding', 'Red', 1, 'Dry clean only. Store in cotton muslin wrap.', 1, 1, 'cat_kanjivaram', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_137', 'Royal Blue Kanjivaram with Gold Chakra Border', 'royal-blue-kanjivaram-chakra', 'A majestic royal blue Kanjivaram silk with a broad gold chakra (wheel) border. The deep blue represents royalty while the gold border adds traditional grandeur.', 4999, 10999, 'SKU-137', 5, '[\"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80\"]', 'Kanjivaram', 'Wedding', 'Blue', 1, 'Dry clean only. Never fold on the same line repeatedly.', 1, 1, 'cat_kanjivaram', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_138', 'Mango Yellow Kanjivaram with Mango Motif Border', 'mango-yellow-kanjivaram-mango', 'A sunny mango yellow Kanjivaram silk saree with the iconic mango (paisley) motif border in contrasting purple and gold. A celebration of South Indian weaving at its finest.', 4499, 9499, 'SKU-138', 7, '[\"https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80\"]', 'Kanjivaram', 'Festive', 'Yellow', 1, 'Dry clean only. Air out periodically.', 0, 1, 'cat_kanjivaram', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_139', 'Emerald Green Kanjivaram with Rudraksham Border', 'emerald-kanjivaram-rudraksham', 'A divine emerald green Kanjivaram silk with the sacred Rudraksham (bead) border pattern. This temple-inspired design is auspicious and perfect for religious ceremonies.', 5499, 11999, 'SKU-139', 4, '[\"https://images.unsplash.com/photo-1564459031891-f5e6b3fb79de?w=600&q=80\"]', 'Kanjivaram', 'Wedding', 'Green', 1, 'Dry clean only. Sacred weave — store with respect.', 0, 1, 'cat_kanjivaram', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_140', 'Plum Purple Kanjivaram with Coin Motifs', 'plum-purple-kanjivaram-coin', 'A striking plum purple Kanjivaram silk saree with traditional coin (kasu) motifs scattered across the body. The gold coins represent prosperity and are woven in pure zari.', 4799, 9999, 'SKU-140', 6, '[\"https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80\"]', 'Kanjivaram', 'Festive', 'Purple', 1, 'Dry clean only. Store flat in a dry place.', 0, 1, 'cat_kanjivaram', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_141', 'Magenta Kanjivaram with Annapakshi Border', 'magenta-kanjivaram-annapakshi', 'A vibrant magenta Kanjivaram silk featuring the mythical Annapakshi (swan) border motif. This iconic design represents grace and beauty in South Indian textile tradition.', 5299, 10999, 'SKU-141', 5, '[\"https://images.unsplash.com/photo-1594938298603-c8148c4b4283?w=600&q=80\"]', 'Kanjivaram', 'Wedding', 'Magenta', 1, 'Dry clean only. Pure mulberry silk — extremely delicate.', 1, 1, 'cat_kanjivaram', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_142', 'Candy Pink Kanjivaram with Checks Pattern', 'candy-pink-kanjivaram-checks', 'A playful candy pink Kanjivaram silk saree with contrasting checks pattern in gold and green. A modern take on the traditional Kanjivaram, perfect for young brides.', 3999, 8499, 'SKU-142', 8, '[\"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80\"]', 'Kanjivaram', 'Festive', 'Pink', 1, 'Dry clean only. Avoid hanging for long periods.', 0, 1, 'cat_kanjivaram', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_143', 'Copper Bronze Kanjivaram with Getti Border', 'copper-bronze-kanjivaram-getti', 'A unique copper bronze Kanjivaram silk with traditional getti (thick stripe) border in contrasting black and gold. The unusual colour makes a bold fashion statement.', 4299, 8999, 'SKU-143', 6, '[\"https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80\"]', 'Kanjivaram', 'Party', 'Bronze', 1, 'Dry clean only. Store away from moisture.', 0, 1, 'cat_kanjivaram', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_144', 'Ivory White Kanjivaram Bridal with Red Border', 'ivory-kanjivaram-bridal-red-border', 'A pristine ivory white Kanjivaram silk bridal saree with a rich red and gold border. The classic white-and-red combination is timeless for South Indian weddings.', 6499, 13999, 'SKU-144', 3, '[\"https://images.unsplash.com/photo-1594938298603-c8148c4b4283?w=600&q=80\"]', 'Kanjivaram', 'Wedding', 'White', 1, 'Professional dry clean only. Bridal heirloom piece.', 1, 1, 'cat_kanjivaram', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_145', 'Mustard Kanjivaram with Lotus Border', 'mustard-kanjivaram-lotus-border', 'A warm mustard Kanjivaram silk saree with an elegant lotus motif border. The lotus symbolises purity and beauty, making this perfect for pooja and temple visits.', 4199, 8499, 'SKU-145', 7, '[\"https://images.unsplash.com/photo-1564459031891-f5e6b3fb79de?w=600&q=80\"]', 'Kanjivaram', 'Festive', 'Yellow', 1, 'Dry clean only. Handle the gold zari gently.', 0, 1, 'cat_kanjivaram', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_146', 'Maroon Kanjivaram with Diamond Butta', 'maroon-kanjivaram-diamond-butta', 'A rich maroon Kanjivaram silk with all-over diamond-shaped butta motifs in gold. The geometric pattern gives it a regal look suitable for grand celebrations.', 4699, 9999, 'SKU-146', 5, '[\"https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80\"]', 'Kanjivaram', 'Wedding', 'Maroon', 1, 'Dry clean only. Do not use starch.', 0, 1, 'cat_kanjivaram', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_147', 'Teal Green Kanjivaram with Elephant Border', 'teal-green-kanjivaram-elephant', 'A majestic teal green Kanjivaram silk saree featuring the traditional elephant (Gaja) border. Elephants represent strength and wisdom in Indian mythology.', 4899, 10499, 'SKU-147', 4, '[\"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80\"]', 'Kanjivaram', 'Wedding', 'Teal', 1, 'Dry clean only. Premium handwoven piece.', 0, 1, 'cat_kanjivaram', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_148', 'Coral Orange Kanjivaram with Swan Motifs', 'coral-orange-kanjivaram-swan', 'A cheerful coral orange Kanjivaram silk with graceful swan motifs along the pallu and border. The contrast of coral with gold zari creates a festive, youthful look.', 3899, 7999, 'SKU-148', 8, '[\"https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80\"]', 'Kanjivaram', 'Festive', 'Orange', 1, 'Dry clean only. Store folded in muslin.', 0, 1, 'cat_kanjivaram', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000');
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `comparePrice`, `sku`, `stock`, `images`, `fabric`, `occasion`, `color`, `blouseIncluded`, `careInstructions`, `isFeatured`, `isActive`, `categoryId`, `createdAt`, `updatedAt`) VALUES
('prod_149', 'Navy Blue Kanjivaram with Temple Gopuram', 'navy-kanjivaram-temple-gopuram', 'A striking navy blue Kanjivaram silk with an elaborate temple gopuram (tower) border design in gold. This architectural motif pays homage to South Indian temple artistry.', 5199, 10999, 'SKU-149', 4, '[\"https://images.unsplash.com/photo-1594938298603-c8148c4b4283?w=600&q=80\"]', 'Kanjivaram', 'Wedding', 'Navy', 1, 'Dry clean only. Handle the heavy border with care.', 0, 1, 'cat_kanjivaram', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_150', 'Lime Green Kanjivaram with Parrot Motifs', 'lime-green-kanjivaram-parrot', 'A fresh lime green Kanjivaram silk saree with vibrant parrot motifs woven in multicoloured silk thread and gold zari. Parrots are a symbol of love in Indian art.', 4399, 8999, 'SKU-150', 6, '[\"https://images.unsplash.com/photo-1564459031891-f5e6b3fb79de?w=600&q=80\"]', 'Kanjivaram', 'Festive', 'Green', 1, 'Dry clean only. The multicolour threads need gentle handling.', 0, 1, 'cat_kanjivaram', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_151', 'Rust Red Kanjivaram with Vandla Border', 'rust-red-kanjivaram-vandla', 'A traditional rust red Kanjivaram silk with Vandla (musical instrument) border pattern. This rare design showcases the veena motif, symbolising Goddess Saraswati.', 5699, 11999, 'SKU-151', 3, '[\"https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80\"]', 'Kanjivaram', 'Wedding', 'Red', 1, 'Professional dry clean. Rare collector piece.', 0, 1, 'cat_kanjivaram', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_152', 'Pastel Lavender Kanjivaram with Mango Butta', 'pastel-lavender-kanjivaram-mango', 'A dreamy pastel lavender Kanjivaram silk saree with small mango (paisley) butta scattered across the body. The soft colour is modern and refreshing for young women.', 3799, 7999, 'SKU-152', 9, '[\"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80\"]', 'Kanjivaram', 'Festive', 'Lavender', 1, 'Dry clean only. Delicate pastel colour — store in dark.', 0, 1, 'cat_kanjivaram', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_153', 'Deep Wine Kanjivaram with Korvai Technique', 'deep-wine-kanjivaram-korvai', 'A luxurious deep wine Kanjivaram silk made with the Korvai interlocking technique — border and body woven separately and joined with precision. The ultimate in Kanjivaram craftsmanship.', 7499, 14999, 'SKU-153', 2, '[\"https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80\"]', 'Kanjivaram', 'Wedding', 'Wine', 1, 'Professional dry clean only. Museum-quality weave.', 1, 1, 'cat_kanjivaram', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_154', 'Blush Pink Organza with Sequin Work', 'blush-pink-organza-sequin', 'A stunning blush pink organza saree with delicate sequin work creating a galaxy of shimmer. The lightweight fabric and sparkle make it ideal for cocktail parties and receptions.', 2499, 4999, 'SKU-154', 10, '[\"https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80\"]', 'Organza', 'Party', 'Pink', 0, 'Dry clean only. Handle sequins with care.', 1, 1, 'cat_organza', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_155', 'Lilac Organza with 3D Flower Applique', 'lilac-organza-3d-flower', 'A dreamy lilac organza saree with hand-applied 3D fabric flowers along the border and pallu. Each flower is individually crafted, making this a wearable garden.', 2799, 5499, 'SKU-155', 8, '[\"https://images.unsplash.com/photo-1564459031891-f5e6b3fb79de?w=600&q=80\"]', 'Organza', 'Party', 'Lilac', 0, 'Dry clean only. Never iron directly — use steamer.', 1, 1, 'cat_organza', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_156', 'Mint Green Organza with Pearl Embroidery', 'mint-green-organza-pearl', 'A fresh mint green organza saree embellished with tiny pearl beads in floral patterns. The pearls catch light beautifully, creating an ethereal, fairy-tale look.', 2999, 5999, 'SKU-156', 7, '[\"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80\"]', 'Organza', 'Wedding', 'Green', 0, 'Dry clean only. Pearls are delicate — avoid pressure.', 0, 1, 'cat_organza', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_157', 'Ivory Organza with Gold Zardozi Work', 'ivory-organza-gold-zardozi', 'An exquisite ivory organza saree with heavy Zardozi metallic embroidery on the border and pallu. The royal embroidery technique using gold-wrapped threads creates unmatched luxury.', 3499, 6999, 'SKU-157', 5, '[\"https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80\"]', 'Organza', 'Wedding', 'Ivory', 1, 'Professional dry clean only. Zardozi is heavy metalwork.', 1, 1, 'cat_organza', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_158', 'Powder Blue Organza with Digital Print', 'powder-blue-organza-digital-print', 'A modern powder blue organza saree with high-definition digital floral print. The crisp print quality on the sheer organza creates a vibrant, contemporary look.', 1899, 3799, 'SKU-158', 15, '[\"https://images.unsplash.com/photo-1594938298603-c8148c4b4283?w=600&q=80\"]', 'Organza', 'Party', 'Blue', 0, 'Hand wash in cold water gently. Do not wring.', 0, 1, 'cat_organza', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_159', 'Champagne Organza with Thread Work Border', 'champagne-organza-thread-work', 'A sophisticated champagne organza saree with intricate thread work border in matching tones. The tone-on-tone embroidery creates texture without overpowering the soft colour.', 2299, 4499, 'SKU-159', 12, '[\"https://images.unsplash.com/photo-1564459031891-f5e6b3fb79de?w=600&q=80\"]', 'Organza', 'Festive', 'Champagne', 0, 'Dry clean recommended. Iron on lowest setting with cloth.', 0, 1, 'cat_organza', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_160', 'Black Organza with Silver Cutdana Work', 'black-organza-silver-cutdana', 'A dramatic black organza saree with silver cutdana (flat sequin) embellishment creating geometric patterns. The dark base with silver sparkle is perfect for evening glamour.', 2699, 5499, 'SKU-160', 9, '[\"https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80\"]', 'Organza', 'Party', 'Black', 0, 'Dry clean only. Avoid snagging the cutdana.', 0, 1, 'cat_organza', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_161', 'Coral Organza with Mirror Work', 'coral-organza-mirror-work', 'A vibrant coral organza saree studded with tiny mirror (shisha) embroidery work. The mirrors reflect light from every angle, creating a dazzling festive effect.', 2399, 4799, 'SKU-161', 11, '[\"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80\"]', 'Organza', 'Festive', 'Coral', 0, 'Dry clean only. Mirrors are fragile — handle gently.', 0, 1, 'cat_organza', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_162', 'Sage Green Organza with Gota Patti Scallop', 'sage-green-organza-gota-scallop', 'A serene sage green organza saree with scalloped gota patti border creating a wave-like effect. The handcrafted Rajasthani work adds warmth to the sheer fabric.', 2199, 4299, 'SKU-162', 13, '[\"https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80\"]', 'Organza', 'Festive', 'Green', 0, 'Dry clean only. Do not iron the gota border directly.', 0, 1, 'cat_organza', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_163', 'Wine Organza with Resham Floral Vine', 'wine-organza-resham-floral-vine', 'A luxurious wine organza saree with flowing resham embroidery of floral vines along the entire length. The silk thread work on organza creates a beautiful layered depth.', 2899, 5799, 'SKU-163', 7, '[\"https://images.unsplash.com/photo-1594938298603-c8148c4b4283?w=600&q=80\"]', 'Organza', 'Wedding', 'Wine', 0, 'Dry clean only. Embroidery threads are pure silk.', 0, 1, 'cat_organza', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_164', 'Peach Organza with Dabka Embroidery', 'peach-organza-dabka-embroidery', 'A romantic peach organza saree with fine dabka (spring coil) embroidery creating paisley patterns. The metallic dabka adds texture and dimension to the soft peach base.', 3199, 6499, 'SKU-164', 6, '[\"https://images.unsplash.com/photo-1564459031891-f5e6b3fb79de?w=600&q=80\"]', 'Organza', 'Wedding', 'Peach', 1, 'Professional dry clean only. Dabka work needs careful handling.', 0, 1, 'cat_organza', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_165', 'Aqua Blue Organza with Butterfly Motifs', 'aqua-blue-organza-butterfly', 'A playful aqua blue organza saree with hand-embroidered butterfly motifs scattered across the fabric. Perfect for the woman who loves nature-inspired fashion.', 2099, 4199, 'SKU-165', 14, '[\"https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80\"]', 'Organza', 'Party', 'Blue', 0, 'Dry clean recommended. Delicate embroidery.', 0, 1, 'cat_organza', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_166', 'Dusty Mauve Organza with Stone Work', 'dusty-mauve-organza-stone-work', 'A sophisticated dusty mauve organza saree embellished with hand-placed stone (kundan) work along the border. The stones catch light beautifully at evening events.', 2599, 5199, 'SKU-166', 10, '[\"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80\"]', 'Organza', 'Party', 'Mauve', 0, 'Dry clean only. Store flat to protect stones.', 0, 1, 'cat_organza', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_167', 'Lemon Yellow Organza with Zari Checkered', 'lemon-yellow-organza-zari-check', 'A bright lemon yellow organza saree with zari checkered pattern woven throughout. The gold checks on the sunny yellow create a festive, celebratory mood.', 1999, 3999, 'SKU-167', 16, '[\"https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80\"]', 'Organza', 'Festive', 'Yellow', 0, 'Dry clean or gentle hand wash. Iron on low.', 0, 1, 'cat_organza', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_168', 'Rose Gold Organza with Laser Cut Border', 'rose-gold-organza-laser-cut', 'A trendy rose gold organza saree with precision laser-cut border creating intricate lace-like patterns. Modern technology meets traditional draping for a contemporary look.', 2349, 4699, 'SKU-168', 11, '[\"https://images.unsplash.com/photo-1594938298603-c8148c4b4283?w=600&q=80\"]', 'Organza', 'Party', 'Rose Gold', 0, 'Dry clean only. Laser-cut edges are delicate.', 0, 1, 'cat_organza', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_169', 'Forest Green Organza with Velvet Applique', 'forest-green-organza-velvet', 'A rich forest green organza saree with velvet applique work creating leaf patterns along the border. The contrast of sheer organza and plush velvet is luxuriously tactile.', 2799, 5599, 'SKU-169', 8, '[\"https://images.unsplash.com/photo-1564459031891-f5e6b3fb79de?w=600&q=80\"]', 'Organza', 'Festive', 'Green', 0, 'Dry clean only. Velvet needs special care.', 0, 1, 'cat_organza', '2026-07-23 12:07:58.000', '2026-07-23 12:07:58.000'),
('prod_170', 'Natural Gold Tussar Silk with Madhubani', 'natural-gold-tussar-madhubani', 'A rich natural gold Tussar silk saree hand-painted with authentic Madhubani art from Bihar. Each piece is unique, featuring fish, peacock, and lotus motifs in vibrant natural dyes.', 2499, 4999, 'SKU-170', 8, '[\"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80\"]', 'Tussar Silk', 'Festive', 'Gold', 0, 'Dry clean only. Hand-painted — avoid water contact.', 1, 1, 'cat_tussar', '2026-07-23 12:07:59.000', '2026-07-23 12:07:59.000'),
('prod_171', 'Beige Tussar Silk with Kantha Embroidery', 'beige-tussar-kantha-embroidery', 'A warm beige Tussar silk saree with delicate Kantha running-stitch embroidery from Bengal. The simple yet beautiful needlework creates stories of village life on silk canvas.', 2299, 4499, 'SKU-171', 10, '[\"https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80\"]', 'Tussar Silk', 'Festive', 'Beige', 0, 'Dry clean recommended. Kantha stitch is hand-sewn.', 0, 1, 'cat_tussar', '2026-07-23 12:07:59.000', '2026-07-23 12:07:59.000'),
('prod_172', 'Mustard Tussar Silk with Batik Print', 'mustard-tussar-batik-print', 'A vibrant mustard Tussar silk saree with wax-resist batik printing. The organic patterns created by the batik process make each piece one-of-a-kind.', 1899, 3799, 'SKU-172', 12, '[\"https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80\"]', 'Tussar Silk', 'Office', 'Mustard', 0, 'Dry clean for first wash. Then gentle hand wash.', 0, 1, 'cat_tussar', '2026-07-23 12:07:59.000', '2026-07-23 12:07:59.000'),
('prod_173', 'Terracotta Tussar Silk with Tribal Print', 'terracotta-tussar-tribal-print', 'An earthy terracotta Tussar silk saree with tribal art print inspired by Warli and Gond traditions. The raw texture of Tussar paired with primitive art creates a rustic elegance.', 1999, 3999, 'SKU-173', 14, '[\"https://images.unsplash.com/photo-1594938298603-c8148c4b4283?w=600&q=80\"]', 'Tussar Silk', 'Casual', 'Brown', 0, 'Dry clean or gentle hand wash in cold water.', 0, 1, 'cat_tussar', '2026-07-23 12:07:59.000', '2026-07-23 12:07:59.000'),
('prod_174', 'Olive Tussar Silk with Zari Border', 'olive-tussar-zari-border', 'An elegant olive green Tussar silk saree with a rich gold zari border. The natural sheen of Tussar combined with gold zari is perfect for festive occasions and pujas.', 2199, 4299, 'SKU-174', 11, '[\"https://images.unsplash.com/photo-1564459031891-f5e6b3fb79de?w=600&q=80\"]', 'Tussar Silk', 'Festive', 'Olive', 0, 'Dry clean only. Zari border needs gentle care.', 0, 1, 'cat_tussar', '2026-07-23 12:07:59.000', '2026-07-23 12:07:59.000'),
('prod_175', 'Copper Tussar Silk with Sujni Embroidery', 'copper-tussar-sujni-embroidery', 'A warm copper Tussar silk saree with Sujni embroidery from Bihar — colourful chain-stitch patterns depicting village scenes, trees, and animals in vivid threads.', 2699, 5499, 'SKU-175', 7, '[\"https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80\"]', 'Tussar Silk', 'Festive', 'Copper', 0, 'Dry clean only. Embroidery is dense — avoid pulling.', 1, 1, 'cat_tussar', '2026-07-23 12:07:59.000', '2026-07-23 12:07:59.000'),
('prod_176', 'Natural Ecru Tussar with Block Print', 'natural-ecru-tussar-block-print', 'A pure natural ecru (undyed) Tussar silk with hand block print in indigo and red. The raw, unbleached silk showcases the fabric in its most authentic form.', 1799, 3599, 'SKU-176', 15, '[\"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80\"]', 'Tussar Silk', 'Daily', 'Cream', 0, 'Hand wash in cold water. Natural silk — avoid bleach.', 0, 1, 'cat_tussar', '2026-07-23 12:07:59.000', '2026-07-23 12:07:59.000'),
('prod_177', 'Deep Brown Tussar Silk with Gold Tissue Pallu', 'deep-brown-tussar-gold-tissue', 'A sophisticated deep brown Tussar silk saree with a stunning gold tissue pallu. The contrast of earthy brown body with golden pallu creates an opulent draping effect.', 2899, 5799, 'SKU-177', 6, '[\"https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80\"]', 'Tussar Silk', 'Party', 'Brown', 1, 'Dry clean only. Tissue pallu needs careful handling.', 0, 1, 'cat_tussar', '2026-07-23 12:07:59.000', '2026-07-23 12:07:59.000'),
('prod_178', 'Rust Tussar Silk with Kalamkari Pallu', 'rust-tussar-kalamkari-pallu', 'A warm rust Tussar silk with a hand-painted Kalamkari pallu depicting mythological scenes. The natural fabric paired with ancient art form is a collector delight.', 2599, 5199, 'SKU-178', 8, '[\"https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80\"]', 'Tussar Silk', 'Festive', 'Rust', 0, 'Dry clean only. Hand-painted art — protect from water.', 0, 1, 'cat_tussar', '2026-07-23 12:07:59.000', '2026-07-23 12:07:59.000'),
('prod_179', 'Maroon Tussar Silk with Sequin Butis', 'maroon-tussar-sequin-butis', 'A festive maroon Tussar silk saree with hand-stitched sequin butis scattered across the body. The sparkle on the matte Tussar texture creates a beautiful contrast.', 2399, 4799, 'SKU-179', 9, '[\"https://images.unsplash.com/photo-1594938298603-c8148c4b4283?w=600&q=80\"]', 'Tussar Silk', 'Party', 'Maroon', 0, 'Dry clean only. Do not iron directly on sequins.', 0, 1, 'cat_tussar', '2026-07-23 12:07:59.000', '2026-07-23 12:07:59.000'),
('prod_180', 'Taupe Tussar Silk with French Knot Work', 'taupe-tussar-french-knot', 'A chic taupe Tussar silk saree with hand-embroidered French knot clusters forming floral bunches along the border and pallu. A sophisticated choice for art lovers.', 2799, 5599, 'SKU-180', 6, '[\"https://images.unsplash.com/photo-1564459031891-f5e6b3fb79de?w=600&q=80\"]', 'Tussar Silk', 'Party', 'Taupe', 0, 'Dry clean recommended. French knots are delicate.', 0, 1, 'cat_tussar', '2026-07-23 12:07:59.000', '2026-07-23 12:07:59.000'),
('prod_181', 'Salmon Pink Tussar with Applique Border', 'salmon-pink-tussar-applique', 'A lovely salmon pink Tussar silk with fabric applique border in contrasting colours. The cut-and-stitch technique adds dimension and a folk-art quality to the saree.', 2099, 4199, 'SKU-181', 11, '[\"https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80\"]', 'Tussar Silk', 'Casual', 'Pink', 0, 'Dry clean or careful hand wash in cold water.', 0, 1, 'cat_tussar', '2026-07-23 12:07:59.000', '2026-07-23 12:07:59.000'),
('prod_182', 'Charcoal Tussar Silk with Shibori Effect', 'charcoal-tussar-shibori-effect', 'A moody charcoal Tussar silk saree with Shibori-inspired resist dyeing creating abstract cloud-like patterns. The dark, artistic look is perfect for gallery openings and cultural events.', 2199, 4399, 'SKU-182', 10, '[\"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80\"]', 'Tussar Silk', 'Party', 'Charcoal', 0, 'Dry clean only. Dye patterns may vary slightly.', 0, 1, 'cat_tussar', '2026-07-23 12:07:59.000', '2026-07-23 12:07:59.000'),
('prod_183', 'Honey Gold Tussar with Pochampally Ikat', 'honey-gold-tussar-pochampally', 'A rich honey gold Tussar silk saree with Pochampally Ikat patterns on the border and pallu. The geometric Ikat designs in contrasting black and red add a bold dimension.', 2399, 4799, 'SKU-183', 9, '[\"https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80\"]', 'Tussar Silk', 'Office', 'Gold', 0, 'Dry clean recommended. Ikat colours are resist-dyed.', 0, 1, 'cat_tussar', '2026-07-23 12:07:59.000', '2026-07-23 12:07:59.000'),
('prod_184', 'Burgundy Tussar Silk Gicha with Zari Pallu', 'burgundy-tussar-gicha-zari', 'A premium burgundy Tussar Gicha silk saree with heavy zari pallu. Gicha silk has a unique textured weave that gives it extra body and structure, making it drape beautifully.', 3199, 6499, 'SKU-184', 5, '[\"https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80\"]', 'Tussar Silk', 'Wedding', 'Burgundy', 1, 'Dry clean only. Premium Gicha silk — handle with care.', 0, 1, 'cat_tussar', '2026-07-23 12:07:59.000', '2026-07-23 12:07:59.000'),
('prod_185', 'Natural Beige Linen Saree with Zari Stripes', 'natural-beige-linen-zari-stripes', 'A minimalist natural beige linen saree with thin gold zari stripes. The crisp linen texture and subtle metallic accents make it ideal for corporate events and office wear.', 1299, 2699, 'SKU-185', 20, '[\"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80\"]', 'Linen', 'Office', 'Beige', 0, 'Machine wash cold. Iron while damp for best results.', 0, 1, 'cat_linen', '2026-07-23 12:07:59.000', '2026-07-23 12:07:59.000'),
('prod_186', 'Steel Grey Linen Saree with Silver Border', 'steel-grey-linen-silver-border', 'A sophisticated steel grey linen saree with a sleek silver thread border. The industrial-chic colour and clean lines are perfect for the modern professional woman.', 1399, 2899, 'SKU-186', 18, '[\"https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80\"]', 'Linen', 'Office', 'Grey', 0, 'Machine wash cold on gentle. Iron on medium-high.', 0, 1, 'cat_linen', '2026-07-23 12:07:59.000', '2026-07-23 12:07:59.000'),
('prod_187', 'Dusty Rose Linen with Embroidered Pallu', 'dusty-rose-linen-embroidered-pallu', 'A soft dusty rose linen saree with delicate floral embroidery on the pallu. The combination of rustic linen texture with feminine embroidery creates effortless charm.', 1599, 3199, 'SKU-187', 14, '[\"https://images.unsplash.com/photo-1564459031891-f5e6b3fb79de?w=600&q=80\"]', 'Linen', 'Casual', 'Pink', 0, 'Hand wash for embroidered section. Machine wash body.', 0, 1, 'cat_linen', '2026-07-23 12:07:59.000', '2026-07-23 12:07:59.000'),
('prod_188', 'Sage Linen Saree with Thread Work Border', 'sage-linen-thread-work-border', 'A calming sage green linen saree with a beautifully hand-embroidered thread work border in contrasting maroon and gold. Perfect for day events and brunch gatherings.', 1449, 2999, 'SKU-188', 16, '[\"https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80\"]', 'Linen', 'Casual', 'Green', 0, 'Hand wash in cold water. Iron while slightly damp.', 1, 1, 'cat_linen', '2026-07-23 12:07:59.000', '2026-07-23 12:07:59.000'),
('prod_189', 'Ivory Linen with Kalamkari Print', 'ivory-linen-kalamkari-print', 'An elegant ivory linen saree with traditional Kalamkari print depicting mythological scenes from Ramayana. The natural linen and vegetable dyes create an earthy, artisanal look.', 1349, 2799, 'SKU-189', 15, '[\"https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80\"]', 'Linen', 'Festive', 'Ivory', 0, 'Hand wash in cold water. Natural dyes — wash separately.', 0, 1, 'cat_linen', '2026-07-23 12:07:59.000', '2026-07-23 12:07:59.000'),
('prod_190', 'Teal Linen Saree with Gold Temple Border', 'teal-linen-gold-temple-border', 'A striking teal linen saree with a broad gold temple border woven in contrast. The structured drape of linen combined with traditional temple design is uniquely appealing.', 1499, 2999, 'SKU-190', 13, '[\"https://images.unsplash.com/photo-1594938298603-c8148c4b4283?w=600&q=80\"]', 'Linen', 'Festive', 'Teal', 0, 'Machine wash cold. Iron on high heat for crisp finish.', 0, 1, 'cat_linen', '2026-07-23 12:07:59.000', '2026-07-23 12:07:59.000'),
('prod_191', 'Mustard Linen with Block Print Butis', 'mustard-linen-block-print-butis', 'A cheerful mustard linen saree with hand block-printed butis (small motifs) in indigo. The combination of Indian craft and European fabric creates a global fusion look.', 1199, 2499, 'SKU-191', 22, '[\"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80\"]', 'Linen', 'Daily', 'Yellow', 0, 'Machine wash cold. Block print colours are fast.', 0, 1, 'cat_linen', '2026-07-23 12:07:59.000', '2026-07-23 12:07:59.000'),
('prod_192', 'Navy Linen Saree with Contrast Red Pallu', 'navy-linen-contrast-red-pallu', 'A bold navy blue linen saree with a dramatic contrast red pallu. The colour-block approach is modern and eye-catching, perfect for women who love making a statement.', 1349, 2699, 'SKU-192', 17, '[\"https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80\"]', 'Linen', 'Party', 'Navy', 0, 'Machine wash cold with similar colours. Iron on high.', 0, 1, 'cat_linen', '2026-07-23 12:07:59.000', '2026-07-23 12:07:59.000'),
('prod_193', 'Burnt Orange Linen with Warli Art', 'burnt-orange-linen-warli-art', 'A warm burnt orange linen saree with Warli tribal art printed in white. The primitive stick-figure art depicting harvest, dance, and daily life adds a rustic, artsy vibe.', 1249, 2499, 'SKU-193', 19, '[\"https://images.unsplash.com/photo-1564459031891-f5e6b3fb79de?w=600&q=80\"]', 'Linen', 'Daily', 'Orange', 0, 'Machine wash cold. Tumble dry low.', 0, 1, 'cat_linen', '2026-07-23 12:07:59.000', '2026-07-23 12:07:59.000'),
('prod_194', 'Plum Linen Saree with Copper Zari', 'plum-linen-copper-zari', 'A rich plum linen saree with unusual copper-toned zari border and butis. The warm metallic against the cool plum creates a sophisticated autumnal colour palette.', 1549, 3099, 'SKU-194', 12, '[\"https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80\"]', 'Linen', 'Party', 'Plum', 0, 'Hand wash in cold water. Iron on medium heat.', 0, 1, 'cat_linen', '2026-07-23 12:07:59.000', '2026-07-23 12:07:59.000'),
('prod_195', 'Off-White Linen with Pastel Embroidery', 'off-white-linen-pastel-embroidery', 'A pristine off-white linen saree with delicate pastel floral embroidery in blush, mint, and lavender. The multi-colour thread work on white linen is like a spring garden.', 1699, 3399, 'SKU-195', 10, '[\"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80\"]', 'Linen', 'Casual', 'White', 0, 'Dry clean recommended to preserve embroidery colours.', 1, 1, 'cat_linen', '2026-07-23 12:07:59.000', '2026-07-23 12:07:59.000'),
('prod_196', 'Charcoal Linen with Gold Jamdani Motifs', 'charcoal-linen-gold-jamdani', 'A dramatic charcoal linen saree with golden jamdani-inspired supplementary weft motifs. The dark base with gold creates a look that transitions easily from office to evening.', 1449, 2899, 'SKU-196', 15, '[\"https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80\"]', 'Linen', 'Office', 'Charcoal', 0, 'Machine wash cold inside out. Iron on high.', 0, 1, 'cat_linen', '2026-07-23 12:07:59.000', '2026-07-23 12:07:59.000'),
('prod_197', 'Peacock Blue Linen with Ikat Weave', 'peacock-blue-linen-ikat-weave', 'A vibrant peacock blue linen saree with resist-dyed Ikat patterns in white and yellow. The geometric blur of Ikat dyeing adds an artistic, handcrafted quality.', 1399, 2799, 'SKU-197', 14, '[\"https://images.unsplash.com/photo-1594938298603-c8148c4b4283?w=600&q=80\"]', 'Linen', 'Casual', 'Blue', 0, 'Hand wash in cold water. Ikat dyes are colour-fast.', 0, 1, 'cat_linen', '2026-07-23 12:07:59.000', '2026-07-23 12:07:59.000'),
('prod_198', 'Coral Linen Saree with Tassel Pallu', 'coral-linen-tassel-pallu', 'A fun coral linen saree with handmade tassels along the pallu edge and a simple gold lurex border. The tassels add movement and a bohemian touch to the structured linen.', 1299, 2599, 'SKU-198', 18, '[\"https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80\"]', 'Linen', 'Party', 'Coral', 0, 'Hand wash carefully to preserve tassels. Air dry.', 0, 1, 'cat_linen', '2026-07-23 12:07:59.000', '2026-07-23 12:07:59.000'),
('prod_199', 'Moss Green Linen with Satin Border', 'moss-green-linen-satin-border', 'A unique moss green linen saree with a contrasting satin silk border in deeper green. The texture play between matte linen and glossy satin creates visual interest.', 1549, 3099, 'SKU-199', 11, '[\"https://images.unsplash.com/photo-1564459031891-f5e6b3fb79de?w=600&q=80\"]', 'Linen', 'Festive', 'Green', 0, 'Dry clean recommended due to mixed fabrics.', 0, 1, 'cat_linen', '2026-07-23 12:07:59.000', '2026-07-23 12:07:59.000');

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
('cust_anitha', 'Anitha Devi', 'anitha@demo.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGHHkiHp.lmXqO2', '+91 65432 10987', 'CUSTOMER', 1, NULL, 1, '2026-01-10 16:00:00.000', '2026-07-23 11:46:42.000'),
('cust_deepa', 'Deepa Venkatesh', 'deepa@demo.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGHHkiHp.lmXqO2', '+91 54321 09876', 'CUSTOMER', 1, NULL, 0, '2026-03-05 11:15:00.000', '2026-07-23 11:46:42.000'),
('cust_kavitha', 'Kavitha Rajan', 'kavitha@demo.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGHHkiHp.lmXqO2', '+91 76543 21098', 'CUSTOMER', 1, NULL, 8, '2025-10-20 09:00:00.000', '2026-07-23 11:46:42.000'),
('cust_lalitha', 'Lalitha Subramani', 'lalitha@demo.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGHHkiHp.lmXqO2', '+91 21098 76543', 'CUSTOMER', 1, NULL, 0, '2026-06-20 17:00:00.000', '2026-07-23 11:46:42.000'),
('cust_meena', 'Meenakshi Sundaram', 'meena@demo.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGHHkiHp.lmXqO2', '+91 87654 32109', 'CUSTOMER', 1, NULL, 3, '2025-12-01 14:30:00.000', '2026-07-23 11:46:42.000'),
('cust_priya', 'Priya Lakshmi', 'priya@demo.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGHHkiHp.lmXqO2', '+91 98765 43210', 'CUSTOMER', 1, NULL, 5, '2025-11-15 10:00:00.000', '2026-07-23 11:46:42.000'),
('cust_revathi', 'Revathi Krishnan', 'revathi@demo.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGHHkiHp.lmXqO2', '+91 32109 87654', 'CUSTOMER', 1, NULL, 10, '2025-09-01 08:30:00.000', '2026-07-23 11:46:42.000'),
('cust_sangeetha', 'Sangeetha Murali', 'sangeetha@demo.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGHHkiHp.lmXqO2', '+91 43210 98765', 'CUSTOMER', 1, NULL, 2, '2026-02-14 13:45:00.000', '2026-07-23 11:46:42.000'),
('user_admin_001', 'Neelas Admin', 'admin@neelassarees.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGHHkiHp.lmXqO2', '+91 99999 99999', 'SUPER_ADMIN', 1, NULL, 0, '2026-06-29 10:27:32.000', '2026-06-29 10:27:32.000'),
('user_admin_002', 'Development Affixx', 'developmentaffixx@gmail.com', '$2b$12$MoTho5y6.c4QSujBWYz3PeZtR3R5G1PvLZBlqCHpm2frYmUbc67UK', NULL, 'ADMIN', 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXJfYWRtaW5fMDAyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzg1MjMxNTkxLCJleHAiOjE3ODU4MzYzOTF9.ywepsb4IbSEk9fuwr-pCQ7wVEgo-D2ZuLW01EM8wWuM', 0, '2026-06-29 10:29:56.000', '2026-07-28 15:09:52.015');

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
