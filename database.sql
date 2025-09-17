-- MySQL schema for TxPlays Discord integration
-- Run these statements to create the database and required tables.

CREATE DATABASE IF NOT EXISTS `txplays`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `txplays`;

CREATE TABLE IF NOT EXISTS `discord_users` (
  `id` VARCHAR(32) NOT NULL,
  `username` VARCHAR(100) NOT NULL,
  `discriminator` VARCHAR(10) DEFAULT NULL,
  `global_name` VARCHAR(150) DEFAULT NULL,
  `avatar` VARCHAR(128) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `locale` VARCHAR(16) DEFAULT NULL,
  `mfa_enabled` TINYINT(1) DEFAULT NULL,
  `access_token` VARCHAR(255) NOT NULL,
  `refresh_token` VARCHAR(255) DEFAULT NULL,
  `token_type` VARCHAR(20) DEFAULT NULL,
  `token_scope` VARCHAR(255) DEFAULT NULL,
  `token_expires_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_token_expires_at` (`token_expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
