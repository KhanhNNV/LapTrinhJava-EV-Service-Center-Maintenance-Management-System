-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: evservicedb
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments` (
  `appointment_id` int NOT NULL AUTO_INCREMENT,
  `appointment_date` date NOT NULL,
  `appointment_time` time(6) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `service_type` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `status` enum('ASSIGNED','CANCELED','CHECKED_IN','COMPLETED','CONFIRMED','IN_PROGRESS','PENDING') COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `technician_id` int DEFAULT NULL,
  `center_id` int NOT NULL,
  `contract_id` int DEFAULT NULL,
  `customer_id` int NOT NULL,
  `staff_id` int DEFAULT NULL,
  `vehicle_id` int NOT NULL,
  PRIMARY KEY (`appointment_id`),
  KEY `FKi31x63g3sb93cwo03xuexx6qa` (`technician_id`),
  KEY `FK8rj1bo0yghp7xxocvsdxts3dd` (`center_id`),
  KEY `FK3kkk5ji6h6iiq36jqjuc52dxk` (`contract_id`),
  KEY `FK4q5rt20vvnkv7eohwq22l3ayy` (`customer_id`),
  KEY `FK88083ngr9rv9wj4p916pj40c2` (`staff_id`),
  KEY `FKalpncq8pxtwld2wmgw4sxct70` (`vehicle_id`),
  CONSTRAINT `FK3kkk5ji6h6iiq36jqjuc52dxk` FOREIGN KEY (`contract_id`) REFERENCES `customer_package_contracts` (`contract_id`),
  CONSTRAINT `FK4q5rt20vvnkv7eohwq22l3ayy` FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `FK88083ngr9rv9wj4p916pj40c2` FOREIGN KEY (`staff_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `FK8rj1bo0yghp7xxocvsdxts3dd` FOREIGN KEY (`center_id`) REFERENCES `service_centers` (`center_id`),
  CONSTRAINT `FKalpncq8pxtwld2wmgw4sxct70` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`),
  CONSTRAINT `FKi31x63g3sb93cwo03xuexx6qa` FOREIGN KEY (`technician_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES (1,'2025-11-20','09:00:00.000000','2025-11-15 14:30:00.000000','Khách hàng muốn kiểm tra thêm hệ thống điện','Thay dầu định kỳ','PENDING',NULL,2,1,NULL,7,5,1),(2,'2025-11-21','10:00:00.000000','2025-11-15 14:35:00.000000',NULL,'Kiểm tra ắc quy','PENDING',NULL,2,1,NULL,8,5,2),(3,'2025-11-22','11:00:00.000000','2025-11-15 14:40:00.000000','Khách hàng yêu cầu kiểm tra phanh','Bảo dưỡng tổng quát','PENDING',NULL,3,1,NULL,9,5,3),(4,'2025-11-23','13:00:00.000000','2025-11-15 14:45:00.000000',NULL,'Cập nhật phần mềm','PENDING',NULL,3,1,NULL,10,5,4),(5,'2025-11-24','14:00:00.000000','2025-11-15 14:50:00.000000','Khách hàng muốn thay lốp mới loại tốt','Thay lốp','PENDING',NULL,2,1,NULL,11,5,5),(6,'2025-11-25','15:00:00.000000','2025-11-15 14:55:00.000000',NULL,'Kiểm tra hệ thống điện','PENDING',NULL,2,1,NULL,12,5,6),(7,'2025-11-26','09:30:00.000000','2025-11-15 15:00:00.000000',NULL,'Bảo dưỡng tổng quát','PENDING',NULL,3,1,NULL,13,5,7),(8,'2025-11-27','10:30:00.000000','2025-11-15 15:05:00.000000','Khách hàng yêu cầu kiểm tra pin','Thay dầu định kỳ','PENDING',NULL,3,1,NULL,14,5,8),(9,'2025-11-28','11:30:00.000000','2025-11-15 15:10:00.000000',NULL,'Cập nhật phần mềm','PENDING',NULL,2,1,NULL,15,5,9),(10,'2025-11-29','13:30:00.000000','2025-11-15 15:15:00.000000','Khách hàng yêu cầu thay loại lốp chính hãng','Thay lốp','PENDING',NULL,2,1,NULL,16,5,10);
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `certificates`
--

DROP TABLE IF EXISTS `certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificates` (
  `certificate_id` int NOT NULL AUTO_INCREMENT,
  `certificate_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `certificate_type` enum('ELECTRIC_CAR_REPAIR','ELECTRIC_MOTORBIKE_REPAIR') COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `issuing_organization` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `validity_period` int NOT NULL,
  PRIMARY KEY (`certificate_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificates`
--

LOCK TABLES `certificates` WRITE;
/*!40000 ALTER TABLE `certificates` DISABLE KEYS */;
INSERT INTO `certificates` VALUES (1,'Chứng chỉ sửa chữa xe điện cơ bản','ELECTRIC_CAR_REPAIR','Đào tạo kỹ thuật cơ bản về xe ô tô điện','EV Training Center',1825),(2,'Chứng chỉ sửa chữa xe điện nâng cao','ELECTRIC_CAR_REPAIR','Kỹ năng nâng cao về hệ thống điện và pin ô tô điện','EV Training Center',1825),(3,'Chứng chỉ bảo dưỡng hệ thống pin','ELECTRIC_CAR_REPAIR','Đào tạo chuyên sâu về pin và quản lý năng lượng xe điện','EV Training Center',1825);
/*!40000 ALTER TABLE `certificates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `conversation_id` int NOT NULL AUTO_INCREMENT,
  `start_time` date NOT NULL,
  `status` enum('CLOSED','IN_PROGRESS','NEW') COLLATE utf8mb4_unicode_ci NOT NULL,
  `topic` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` int NOT NULL,
  `staff_id` int DEFAULT NULL,
  PRIMARY KEY (`conversation_id`),
  KEY `FKaim02rk3jmh6iu2532wid9ukn` (`customer_id`),
  KEY `FKkqj4jhw5anomkjvrrg2led1vo` (`staff_id`),
  CONSTRAINT `FKaim02rk3jmh6iu2532wid9ukn` FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `FKkqj4jhw5anomkjvrrg2led1vo` FOREIGN KEY (`staff_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_package_contracts`
--

DROP TABLE IF EXISTS `customer_package_contracts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_package_contracts` (
  `contract_id` int NOT NULL AUTO_INCREMENT,
  `contract_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `end_date` date NOT NULL,
  `start_date` date NOT NULL,
  `status` enum('ACTIVE','CANCELLED','EXPIRED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `package_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`contract_id`),
  KEY `FKmq1wqmwel4vkdyfcfbkgm024n` (`package_id`),
  KEY `FK9c3t6cxp0x2fc71cbpy29xrpl` (`user_id`),
  CONSTRAINT `FK9c3t6cxp0x2fc71cbpy29xrpl` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `FKmq1wqmwel4vkdyfcfbkgm024n` FOREIGN KEY (`package_id`) REFERENCES `service_packages` (`package_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_package_contracts`
--

LOCK TABLES `customer_package_contracts` WRITE;
/*!40000 ALTER TABLE `customer_package_contracts` DISABLE KEYS */;
INSERT INTO `customer_package_contracts` VALUES (1,'Hợp đồng gói cơ bản - Khách hàng 01','2026-11-14','2025-11-15','ACTIVE',1,7),(2,'Hợp đồng gói cơ bản - Khách hàng 02','2026-11-14','2025-11-15','ACTIVE',1,8),(3,'Hợp đồng gói nâng cao - Khách hàng 03','2026-11-14','2025-11-15','ACTIVE',2,9),(4,'Hợp đồng gói cơ bản - Khách hàng 04','2026-11-14','2025-11-15','ACTIVE',1,10);
/*!40000 ALTER TABLE `customer_package_contracts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventories`
--

DROP TABLE IF EXISTS `inventories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventories` (
  `inventory_id` int NOT NULL AUTO_INCREMENT,
  `created_at` date DEFAULT NULL,
  `min_quantity` bigint NOT NULL,
  `quantity` int NOT NULL,
  `updated_at` date DEFAULT NULL,
  `part_id` int NOT NULL,
  `center_id` int NOT NULL,
  PRIMARY KEY (`inventory_id`),
  KEY `FKbcj2jyphxpdxijrrs4gjrvecd` (`part_id`),
  KEY `FKiqa43c68rmb98ks6ng3frlxwp` (`center_id`),
  CONSTRAINT `FKbcj2jyphxpdxijrrs4gjrvecd` FOREIGN KEY (`part_id`) REFERENCES `parts` (`part_id`),
  CONSTRAINT `FKiqa43c68rmb98ks6ng3frlxwp` FOREIGN KEY (`center_id`) REFERENCES `service_centers` (`center_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventories`
--

LOCK TABLES `inventories` WRITE;
/*!40000 ALTER TABLE `inventories` DISABLE KEYS */;
INSERT INTO `inventories` VALUES (1,'2025-11-15',10,50,'2025-11-15',1,1),(2,'2025-11-15',5,30,'2025-11-15',2,1),(3,'2025-11-15',5,20,'2025-11-15',3,2);
/*!40000 ALTER TABLE `inventories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `invoice_id` int NOT NULL AUTO_INCREMENT,
  `invoice_date` date NOT NULL,
  `payment_method` enum('BANK_TRANSFER','CASH','CREDIT_CARD','MOMO','UNSPECIFIED','VNPAY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_status` enum('CANCELLED','PAID','PENDING') COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_amount` double NOT NULL,
  `ticket_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`invoice_id`),
  UNIQUE KEY `UKb46n151aehmo7ekv39o6b0pl5` (`ticket_id`),
  KEY `FKbwr4d4vyqf2bkoetxtt8j9dx7` (`user_id`),
  CONSTRAINT `FKbwr4d4vyqf2bkoetxtt8j9dx7` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `FKimen4lsicpbopj9w5qljlc0w9` FOREIGN KEY (`ticket_id`) REFERENCES `service_tickets` (`ticket_id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES (11,'2025-11-15','CASH','PAID',5500000,1,7),(12,'2025-11-15','BANK_TRANSFER','PAID',5600000,2,8),(13,'2025-11-15','CREDIT_CARD','PAID',5700000,3,9),(14,'2025-11-16','CASH','PAID',5800000,4,10),(15,'2025-11-16','BANK_TRANSFER','PAID',5900000,5,11),(16,'2025-11-16','CASH','PAID',6000000,6,12),(17,'2025-11-17','CREDIT_CARD','PAID',6100000,7,13),(18,'2025-11-17','BANK_TRANSFER','PAID',6200000,8,14),(19,'2025-11-17','CASH','PAID',6300000,9,15),(20,'2025-11-18','CREDIT_CARD','PAID',6400000,10,16);
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `message_id` int NOT NULL AUTO_INCREMENT,
  `content` varchar(1000) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `is_read` bit(1) NOT NULL,
  `timestamp` datetime(6) NOT NULL,
  `conversation_id` int NOT NULL,
  `sender_id` int NOT NULL,
  PRIMARY KEY (`message_id`),
  KEY `FKt492th6wsovh1nush5yl5jj8e` (`conversation_id`),
  KEY `FK4ui4nnwntodh6wjvck53dbk9m` (`sender_id`),
  CONSTRAINT `FK4ui4nnwntodh6wjvck53dbk9m` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `FKt492th6wsovh1nush5yl5jj8e` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`conversation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_read` bit(1) NOT NULL,
  `message` varchar(1000) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `title` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`notification_id`),
  KEY `FK9y21adhxn0ayjhfocscqox7bh` (`user_id`),
  CONSTRAINT `FK9y21adhxn0ayjhfocscqox7bh` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `package_service_item`
--

DROP TABLE IF EXISTS `package_service_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `package_service_item` (
  `package_id` int NOT NULL,
  `item_id` int NOT NULL,
  KEY `FKgrif2tx9q1gv1lmrn00e2r7cr` (`item_id`),
  KEY `FKh3s6vn1nhcbltcq2t26s7op9k` (`package_id`),
  CONSTRAINT `FKgrif2tx9q1gv1lmrn00e2r7cr` FOREIGN KEY (`item_id`) REFERENCES `service_items` (`item_id`),
  CONSTRAINT `FKh3s6vn1nhcbltcq2t26s7op9k` FOREIGN KEY (`package_id`) REFERENCES `service_packages` (`package_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `package_service_item`
--

LOCK TABLES `package_service_item` WRITE;
/*!40000 ALTER TABLE `package_service_item` DISABLE KEYS */;
/*!40000 ALTER TABLE `package_service_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parts`
--

DROP TABLE IF EXISTS `parts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parts` (
  `part_id` int NOT NULL AUTO_INCREMENT,
  `cost_price` double NOT NULL,
  `part_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit_price` double NOT NULL,
  PRIMARY KEY (`part_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parts`
--

LOCK TABLES `parts` WRITE;
/*!40000 ALTER TABLE `parts` DISABLE KEYS */;
INSERT INTO `parts` VALUES (1,1500000,'Lốp xe',2000000),(2,2800000,'Ắc quy',3500000),(3,350000,'Dầu động cơ',500000),(4,900000,'Hệ thống phanh',1200000);
/*!40000 ALTER TABLE `parts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_transactions`
--

DROP TABLE IF EXISTS `payment_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_transactions` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `amount` double NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `gateway` enum('MOMO','VNPAY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `gateway_transaction_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('FAILED','PENDING','SUCCESS') COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `invoice_id` int NOT NULL,
  PRIMARY KEY (`transaction_id`),
  UNIQUE KEY `UK8wwrn5rl87w3g1h4bi5cof3es` (`order_id`),
  KEY `FKd92ib2ip4k7hm0wmou7ckivhl` (`invoice_id`),
  CONSTRAINT `FKd92ib2ip4k7hm0wmou7ckivhl` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`invoice_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_transactions`
--

LOCK TABLES `payment_transactions` WRITE;
/*!40000 ALTER TABLE `payment_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_centers`
--

DROP TABLE IF EXISTS `service_centers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_centers` (
  `center_id` int NOT NULL AUTO_INCREMENT,
  `address` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `center_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`center_id`),
  UNIQUE KEY `UK8xtjfixnfmc1kj19hr8kqd87s` (`email`),
  UNIQUE KEY `UK8o22g6m910w195u65pw9b9c39` (`phone_number`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_centers`
--

LOCK TABLES `service_centers` WRITE;
/*!40000 ALTER TABLE `service_centers` DISABLE KEYS */;
INSERT INTO `service_centers` VALUES (1,'Quận 1, TP. Hồ Chí Minh','EV Service Center HCM','hcm.center@ev.com','0909000111'),(2,'Quận Hoàn Kiếm, Hà Nội','EV Service Center Hà Nội','hanoi.center@ev.com','0909000222');
/*!40000 ALTER TABLE `service_centers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_item_parts`
--

DROP TABLE IF EXISTS `service_item_parts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_item_parts` (
  `quantity` int NOT NULL,
  `part_id` int NOT NULL,
  `item_id` int NOT NULL,
  PRIMARY KEY (`item_id`,`part_id`),
  KEY `FK24f2la5ytaxm1yuh0hvs4ly4u` (`part_id`),
  CONSTRAINT `FK24f2la5ytaxm1yuh0hvs4ly4u` FOREIGN KEY (`part_id`) REFERENCES `parts` (`part_id`),
  CONSTRAINT `FKi9crs8janrjt6wlkunffv70kk` FOREIGN KEY (`item_id`) REFERENCES `service_items` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_item_parts`
--

LOCK TABLES `service_item_parts` WRITE;
/*!40000 ALTER TABLE `service_item_parts` DISABLE KEYS */;
INSERT INTO `service_item_parts` VALUES (1,3,1),(1,2,2),(1,2,3),(1,3,3),(1,4,3),(4,1,5),(1,4,6),(2,4,8);
/*!40000 ALTER TABLE `service_item_parts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_items`
--

DROP TABLE IF EXISTS `service_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_items` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(1000) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `item_name` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `price` double NOT NULL,
  PRIMARY KEY (`item_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_items`
--

LOCK TABLES `service_items` WRITE;
/*!40000 ALTER TABLE `service_items` DISABLE KEYS */;
INSERT INTO `service_items` VALUES (1,'Thay dầu định kỳ cho xe điện, bao gồm lọc dầu và kiểm tra hệ thống bôi trơn','Thay dầu động cơ',500000),(2,'Đo điện áp, kiểm tra dung lượng pin/ắc quy và tình trạng kết nối','Kiểm tra ắc quy',300000),(3,'Kiểm tra và bảo dưỡng toàn bộ hệ thống điện, cơ khí và an toàn của xe','Bảo dưỡng tổng quát',1200000),(4,'Cập nhật phần mềm điều khiển động cơ, pin và hệ thống giải trí','Cập nhật phần mềm',450000),(5,'Thay lốp mới chính hãng, cân chỉnh bánh xe và kiểm tra áp suất','Thay lốp',900000),(6,'Kiểm tra toàn bộ hệ thống phanh, bao gồm đĩa, má và dầu phanh','Kiểm tra phanh',600000),(7,'Vệ sinh khoang động cơ, hệ thống điện và các chi tiết liên quan','Vệ sinh khoang động cơ',350000),(8,'Thay má phanh chính hãng, bao gồm kiểm tra đĩa và hiệu chuẩn hệ thống','Thay má phanh',700000),(9,'Vệ sinh, kiểm tra hoạt động và nạp gas hệ thống điều hòa','Kiểm tra điều hòa',400000),(10,'Cân chỉnh và hiệu chuẩn các cảm biến: ABS, cảm biến lùi, hỗ trợ lái','Hiệu chuẩn cảm biến',300000);
/*!40000 ALTER TABLE `service_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_packages`
--

DROP TABLE IF EXISTS `service_packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_packages` (
  `package_id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `package_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` double NOT NULL,
  PRIMARY KEY (`package_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_packages`
--

LOCK TABLES `service_packages` WRITE;
/*!40000 ALTER TABLE `service_packages` DISABLE KEYS */;
INSERT INTO `service_packages` VALUES (1,'Bảo dưỡng cơ bản cho xe điện',365,'Gói cơ bản',1000000),(2,'Bảo dưỡng nâng cao và kiểm tra tổng quát',365,'Gói nâng cao',2000000);
/*!40000 ALTER TABLE `service_packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_tickets`
--

DROP TABLE IF EXISTS `service_tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_tickets` (
  `ticket_id` int NOT NULL AUTO_INCREMENT,
  `end_time` datetime(6) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `start_time` datetime(6) DEFAULT NULL,
  `status` enum('CANCELLED','COMPLETED','IN_PROGRESS','ON_HOLD') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `appointment_id` int NOT NULL,
  `technician_id` int NOT NULL,
  PRIMARY KEY (`ticket_id`),
  UNIQUE KEY `UKs93vk2ode0uogufhl9ne24b5o` (`appointment_id`),
  KEY `FKp9aj4v2h7pefdwh3o99x7jc8t` (`technician_id`),
  CONSTRAINT `FKn6dpapdh8lsx3w5idil2h91um` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`),
  CONSTRAINT `FKp9aj4v2h7pefdwh3o99x7jc8t` FOREIGN KEY (`technician_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_tickets`
--

LOCK TABLES `service_tickets` WRITE;
/*!40000 ALTER TABLE `service_tickets` DISABLE KEYS */;
INSERT INTO `service_tickets` VALUES 
(1,'2025-11-15 10:00:00.000000','Kiểm tra hệ thống điện','2025-11-15 09:00:00.000000','COMPLETED',1,2),
(2,'2025-11-15 11:00:00.000000',NULL,'2025-11-15 10:00:00.000000','COMPLETED',2,2),
(3,'2025-11-15 12:00:00.000000','Kiểm tra phanh','2025-11-15 11:00:00.000000','COMPLETED',3,3),
(4,'2025-11-16 14:00:00.000000',NULL,'2025-11-16 13:00:00.000000','COMPLETED',4,3),
(5,'2025-11-16 15:00:00.000000','Thay lốp mới','2025-11-16 14:00:00.000000','COMPLETED',5,2),
(6,'2025-11-16 16:00:00.000000',NULL,'2025-11-16 15:00:00.000000','COMPLETED',6,2),
(7,'2025-11-17 10:30:00.000000',NULL,'2025-11-17 09:30:00.000000','COMPLETED',7,3),
(8,'2025-11-17 11:30:00.000000','Kiểm tra pin','2025-11-17 10:30:00.000000','COMPLETED',8,3),
(9,'2025-11-17 12:30:00.000000',NULL,'2025-11-17 11:30:00.000000','COMPLETED',9,2),
(10,'2025-11-18 14:30:00.000000','Thay lốp chính hãng','2025-11-18 13:30:00.000000','COMPLETED',10,2);
/*!40000 ALTER TABLE `service_tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `technician_certificates`
--

DROP TABLE IF EXISTS `technician_certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `technician_certificates` (
  `technician_id` int NOT NULL,
  `credential_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiry_date` date NOT NULL,
  `issue_date` date NOT NULL,
  `notes` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `certificate_id` int NOT NULL,
  PRIMARY KEY (`certificate_id`,`technician_id`),
  UNIQUE KEY `UK9xcbveoa57utidob9gsl7be3f` (`credential_id`),
  KEY `FKcje4rgc9ybbtjdf2bm3xaaoxh` (`technician_id`),
  CONSTRAINT `FK7sof9ok00pnxku2ccmqewgkc9` FOREIGN KEY (`certificate_id`) REFERENCES `certificates` (`certificate_id`),
  CONSTRAINT `FKcje4rgc9ybbtjdf2bm3xaaoxh` FOREIGN KEY (`technician_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `technician_certificates`
--

LOCK TABLES `technician_certificates` WRITE;
/*!40000 ALTER TABLE `technician_certificates` DISABLE KEYS */;
INSERT INTO `technician_certificates` VALUES (2,'T2-CB-230310','2028-03-10','2023-03-10','Hoàn thành khóa sửa chữa cơ bản',1),(3,'T3-CB-230420','2028-04-20','2023-04-20','Đạt chứng chỉ cơ bản xe điện',1),(3,'T3-NC-240215','2029-02-15','2024-02-15','Hoàn thành khóa sửa chữa nâng cao',2),(4,'T4-NC-230601','2028-06-01','2023-06-01','Chứng chỉ nâng cao dành cho kỹ thuật viên',2),(2,'T2-PIN-240105','2029-01-05','2024-01-05','Chứng chỉ chuyên sâu về hệ thống pin',3),(4,'T4-PIN-240312','2029-03-12','2024-03-12','Chứng chỉ bảo dưỡng pin EV',3);
/*!40000 ALTER TABLE `technician_certificates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_parts`
--

DROP TABLE IF EXISTS `ticket_parts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_parts` (
  `quantity` int NOT NULL,
  `unit_price_at_time_of_service` double NOT NULL,
  `part_id` int NOT NULL,
  `ticket_id` int NOT NULL,
  PRIMARY KEY (`part_id`,`ticket_id`),
  KEY `FK5o3qxm76s1v8xun1rs7f5pimk` (`ticket_id`),
  CONSTRAINT `FK5o3qxm76s1v8xun1rs7f5pimk` FOREIGN KEY (`ticket_id`) REFERENCES `service_tickets` (`ticket_id`),
  CONSTRAINT `FKa406iu36a43f4de3qies1larg` FOREIGN KEY (`part_id`) REFERENCES `parts` (`part_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_parts`
--

LOCK TABLES `ticket_parts` WRITE;
/*!40000 ALTER TABLE `ticket_parts` DISABLE KEYS */;
INSERT INTO `ticket_parts` VALUES (2,2000000,1,5),(2,2000000,1,10),(1,3500000,2,1),(1,3500000,2,7),(1,500000,3,2),(1,500000,3,4),(1,500000,3,6),(1,500000,3,8),(1,500000,3,9),(1,1200000,4,3);
/*!40000 ALTER TABLE `ticket_parts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_service_items`
--

DROP TABLE IF EXISTS `ticket_service_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_service_items` (
  `quantity` int NOT NULL,
  `unit_price_at_time_of_service` double NOT NULL,
  `item_id` int NOT NULL,
  `ticket_id` int NOT NULL,
  PRIMARY KEY (`item_id`,`ticket_id`),
  KEY `FKk0rsul5rdcrfsjacwbcjl40d` (`ticket_id`),
  CONSTRAINT `FK6m0g1h0dvq16jao9f7sf5si2p` FOREIGN KEY (`item_id`) REFERENCES `service_items` (`item_id`),
  CONSTRAINT `FKk0rsul5rdcrfsjacwbcjl40d` FOREIGN KEY (`ticket_id`) REFERENCES `service_tickets` (`ticket_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_service_items`
--

LOCK TABLES `ticket_service_items` WRITE;
/*!40000 ALTER TABLE `ticket_service_items` DISABLE KEYS */;
INSERT INTO `ticket_service_items` VALUES (1,500000,1,2),(1,300000,2,1),(1,300000,2,7),(1,1200000,3,4),(1,450000,4,6),(1,800000,5,5),(1,800000,5,10),(1,600000,6,3),(1,350000,7,8),(1,400000,9,9);
/*!40000 ALTER TABLE `ticket_service_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `address` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('ADMIN','CUSTOMER','STAFF','TECHNICIAN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `center_id` int DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `UKr43af9ap4edm43mmtq01oddj6` (`username`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`),
  UNIQUE KEY `UK9q63snka3mdh91as4io72espi` (`phone_number`),
  KEY `FKnwuxsl4ux127j20jj0yakgp8g` (`center_id`),
  CONSTRAINT `FKnwuxsl4ux127j20jj0yakgp8g` FOREIGN KEY (`center_id`) REFERENCES `service_centers` (`center_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'EV Center - HCM','2025-11-15 14:04:14.052247','HungDuc@gmail.com','Hùng Đức','$2a$10$jceuNY7pkKuWO8AjxPLm5O/6E5K3FcU23HOhDdcieRQNEKkVsL9PS','0392700973','ADMIN',NULL,'hungduc',1),(2,'TP. Hồ Chí Minh','2025-11-15 14:12:34.192127','tech01@example.com','Kỹ thuật viên 01','$2a$10$OvlIsuWnwkW31p7EFcFpA.Y05NCtmc4iCqibQH8CvZ0uTSSTiveE2','0909051232','TECHNICIAN',NULL,'tech01',1),(3,'TP. Hồ Chí Minh','2025-11-15 14:12:52.336868','tech02@example.com','Kỹ thuật viên 02','$2a$10$ChMpJi0P4qd6mAHQAnAWP.8YK.t1LUvwuK2XclAcf0H8sQkc.Vr5y','0909051236','TECHNICIAN',NULL,'tech02',1),(4,'TP. Hồ Chí Minh','2025-11-15 14:13:29.163703','tech03@example.com','Kỹ thuật viên 03','$2a$10$cxBqGipwtftQ.IVk4p2Uk.X8dMDLw4YXgAQK49rX73rhgE7xWz9JW','0909051231','TECHNICIAN',NULL,'tech03',2),(5,'TP HCM','2025-11-15 14:15:50.521421','staff01@example.com','Nhân viên 01','$2a$10$aXnPQ19lcau58Trz5dWyduWhwQnT6tFQvzuRKeIZ4vQit6XI38X7q','0909777559','STAFF',NULL,'staff01',1),(6,'TP HCM','2025-11-15 14:16:11.244582','staff02@example.com','Nhân viên 02','$2a$10$dKx88jqkex73MuDJWl40fe0fRqV3oDhjZw1WRw.Kcy0SIa/xXsLm6','0909777556','STAFF',NULL,'staff02',2),(7,'TP. Hồ Chí Minh','2025-11-15 14:18:35.482303','customer01@gmail.com','Khách hàng 01','$2a$10$ToGLBI0tYtzB7.pL.9wjZOuEhauCtqyJGgC3YsTzIzWNBEdOYfDPO','0900000001','CUSTOMER',NULL,'customer01',NULL),(8,'TP. Hồ Chí Minh','2025-11-15 14:18:41.942916','customer02@gmail.com','Khách hàng 02','$2a$10$OpwtD6VM2lv48YxExDbIPeEgb0B0bSEZxaAP6uqIbN7A5u.42sGUe','0900000002','CUSTOMER',NULL,'customer02',NULL),(9,'TP. Hồ Chí Minh','2025-11-15 14:18:52.197352','customer03@gmail.com','Khách hàng 03','$2a$10$bWPLoo6wmCwyhvmdKhIb1ufPejbTsFMQMrQBHUP34B5t0hSTuYkL2','0900000003','CUSTOMER',NULL,'customer03',NULL),(10,'TP. Hồ Chí Minh','2025-11-15 14:18:59.466383','customer04@gmail.com','Khách hàng 04','$2a$10$x2SoklkcccTo3wjAkujx.u8Itqu8nislGTubMvT4KyQOhCqw5/o52','0900000004','CUSTOMER',NULL,'customer04',NULL),(11,'TP. Hồ Chí Minh','2025-11-15 14:19:06.525417','customer05@gmail.com','Khách hàng 05','$2a$10$Z/xnkUKuNeluzBAXIHJkPe6vCJ8ab83Lz76B7JRq7GCpbNWnghJoC','0900000005','CUSTOMER',NULL,'customer05',NULL),(12,'TP. Hồ Chí Minh','2025-11-15 14:19:13.892137','customer06@gmail.com','Khách hàng 06','$2a$10$j539XtHO8V1YQZfASKZXkOZsBVpydrnBXxZ6EesA66UDG1uuvgDjW','0900000006','CUSTOMER',NULL,'customer06',NULL),(13,'TP. Hồ Chí Minh','2025-11-15 14:19:24.052723','customer07@gmail.com','Khách hàng 07','$2a$10$LR/b3eO3xZImQMnWNYALauRCnNb49Rj2BoI4auVm86Kgb6yWXHO7m','0900000007','CUSTOMER',NULL,'customer07',NULL),(14,'TP. Hồ Chí Minh','2025-11-15 14:19:38.343207','customer08@gmail.com','Khách hàng 08','$2a$10$06lq2nE7/g.spIZ/kTOXS.gN7GfS0iHT17BZKs/uXUuUkoG2NPw4m','0900000008','CUSTOMER',NULL,'customer08',NULL),(15,'TP. Hồ Chí Minh','2025-11-15 14:19:45.732235','customer09@gmail.com','Khách hàng 09','$2a$10$mMeqjHkk0YbI776shCNX9uadVzq3uU3v/cpEsCMFpNpVK1qwKhDHS','0900000009','CUSTOMER',NULL,'customer09',NULL),(16,'TP. Hồ Chí Minh','2025-11-15 14:19:52.711446','customer10@gmail.com','Khách hàng 10','$2a$10$46GFLXMl.qsJoARuRnXbZuKvjMCAIKuX1QzFIvOw3vUsvph7wUlg2','0900000010','CUSTOMER',NULL,'customer10',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicles` (
  `vehicle_id` int NOT NULL AUTO_INCREMENT,
  `brand` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `license_plate` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `recent_maintenance_date` date DEFAULT NULL,
  `vehicle_type` enum('ELECTRIC_CAR','ELECTRIC_MOTORBIKE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `center_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`vehicle_id`),
  UNIQUE KEY `UK9vovnbiegxevdhqfcwvp2g8pj` (`license_plate`),
  KEY `FKp30vti0brmwl0idlejcb6yc9x` (`center_id`),
  KEY `FKo4u5y92lt2sx8y2dc1bb9sewc` (`user_id`),
  CONSTRAINT `FKo4u5y92lt2sx8y2dc1bb9sewc` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `FKp30vti0brmwl0idlejcb6yc9x` FOREIGN KEY (`center_id`) REFERENCES `service_centers` (`center_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicles`
--

LOCK TABLES `vehicles` WRITE;
/*!40000 ALTER TABLE `vehicles` DISABLE KEYS */;
INSERT INTO `vehicles` VALUES (1,'Toyota','51A-00001','Vios','2025-10-01','ELECTRIC_CAR',1,7),(2,'Nissan','51A-00002','Leaf','2025-10-05','ELECTRIC_CAR',1,8),(3,'Tesla','51A-00003','Model 3','2025-09-25','ELECTRIC_CAR',1,9),(4,'BMW','51A-00004','i3','2025-10-10','ELECTRIC_CAR',1,10),(5,'Volkswagen','51A-00005','e-Golf','2025-10-15','ELECTRIC_CAR',1,11),(6,'Kia','51A-00006','Soul EV','2025-10-20','ELECTRIC_CAR',1,12),(7,'Chevrolet','51A-00007','Bolt EV','2025-09-30','ELECTRIC_CAR',1,13),(8,'Mercedes','51A-00008','EQC','2025-10-18','ELECTRIC_CAR',1,14),(9,'Renault','51A-00009','Zoe','2025-10-12','ELECTRIC_CAR',1,15),(10,'Nissan','51A-00010','Leaf','2025-09-28','ELECTRIC_CAR',1,16);
/*!40000 ALTER TABLE `vehicles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'evservicedb'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-15 16:07:12
