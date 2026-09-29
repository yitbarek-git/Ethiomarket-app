-- ==========================================================
-- EthioMarket: Production MySQL Schema
-- Character Set: utf8mb4 (Full support for Ge'ez/Amharic, Tigrinya, Oromo & Somali)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS ethiomarket
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ethiomarket;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('BUYER', 'VENDOR', 'ADMIN') NOT NULL DEFAULT 'BUYER',
  profile_image TEXT,
  location VARCHAR(255) DEFAULT 'Addis Ababa, Ethiopia',
  phone VARCHAR(64) DEFAULT '+251900000000',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  product_condition ENUM('NEW', 'USED', 'REFURBISHED') NOT NULL DEFAULT 'NEW',
  category VARCHAR(100) NOT NULL,
  images_json JSON,
  stock INT NOT NULL DEFAULT 1,
  location VARCHAR(255) NOT NULL DEFAULT 'Addis Ababa, Ethiopia',
  rating DECIMAL(3, 2) DEFAULT 0.00,
  is_approved BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  vendor_id VARCHAR(64) NOT NULL,
  vendor_name VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_products_category (category),
  INDEX idx_products_price (price),
  INDEX idx_products_condition (product_condition),
  INDEX idx_products_vendor (vendor_id),
  INDEX idx_products_location (location),
  FULLTEXT INDEX idx_products_search (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  buyer_id VARCHAR(64) NOT NULL,
  buyer_name VARCHAR(255) NOT NULL,
  items_json JSON NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  payment_method ENUM('CHAPA', 'TELEBIRR', 'CASH_ON_DELIVERY') NOT NULL DEFAULT 'CASH_ON_DELIVERY',
  payment_status ENUM('PENDING', 'PAID', 'FAILED') NOT NULL DEFAULT 'PENDING',
  delivery_status ENUM('PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  chapa_ref VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_orders_buyer (buyer_id),
  INDEX idx_orders_payment_status (payment_status),
  INDEX idx_orders_delivery_status (delivery_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(64) PRIMARY KEY,
  text TEXT NOT NULL,
  sender_id VARCHAR(64) NOT NULL,
  receiver_id VARCHAR(64) NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  receiver_name VARCHAR(255) NOT NULL,
  product_id VARCHAR(64),
  product_title VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_messages_sender (sender_id),
  INDEX idx_messages_receiver (receiver_id),
  INDEX idx_messages_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(64) PRIMARY KEY,
  product_id VARCHAR(64) NOT NULL,
  reviewer_id VARCHAR(64) NOT NULL,
  reviewer_name VARCHAR(255) NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reviews_product (product_id),
  INDEX idx_reviews_reviewer (reviewer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
