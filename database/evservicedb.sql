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
  `status` enum('ASSIGNED','CANCELLED','CHECKED_IN','COMPLETED','CONFIRMED','IN_PROGRESS','PENDING') COLLATE utf8mb4_unicode_ci NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES (1,'2025-11-24','13:04:00.000000','2025-11-23 11:04:25.401096','','Bảo dưỡng xe','COMPLETED','2025-11-23 11:37:38.699947',3,1,NULL,7,6,1),(2,'2025-11-26','11:09:00.000000','2025-11-23 11:09:28.746812','','Sửa chữa xe','COMPLETED','2025-11-23 11:43:55.041120',2,1,NULL,8,6,2),(3,'2025-11-23','04:20:00.000000','2025-11-23 11:12:34.163262','','Bảo dưỡng xe','COMPLETED','2025-11-23 11:44:51.695073',3,1,NULL,9,6,3),(4,'2025-11-23','11:46:00.000000','2025-11-23 11:46:37.610561','','Sửa chữa xe','COMPLETED','2025-11-23 11:48:10.216423',3,2,NULL,7,6,1),(5,'2025-11-23','12:10:00.000000','2025-11-23 12:10:41.181406','','Sửa chữa xe','COMPLETED','2025-11-23 12:15:46.287345',4,1,NULL,8,6,2),(6,'2025-11-23','12:11:00.000000','2025-11-23 12:11:14.394276','','Sửa chữa xe','COMPLETED','2025-11-23 12:14:36.211083',3,2,NULL,9,6,3),(7,'2025-11-23','12:13:00.000000','2025-11-23 12:13:06.458861','','Sửa chữa xe','COMPLETED','2025-11-23 12:15:13.542105',3,1,NULL,10,6,4);
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificates`
--

LOCK TABLES `certificates` WRITE;
/*!40000 ALTER TABLE `certificates` DISABLE KEYS */;
INSERT INTO `certificates` VALUES (1,'Chứng chỉ kỹ thuật sửa chữa xe ô tô điện','ELECTRIC_CAR_REPAIR','Chứng chỉ xác nhận kỹ thuật viên có đủ kỹ năng để sửa chữa và bảo dưỡng xe ô tô điện.','Bộ Giao Thông Vận Tải',1825),(2,'Chứng chỉ kỹ thuật sửa chữa xe máy điện','ELECTRIC_MOTORBIKE_REPAIR','Chứng chỉ xác nhận kỹ thuật viên có đủ kỹ năng để sửa chữa và bảo dưỡng xe máy điện.','Bộ Giao Thông Vận Tải',1825);
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
  `last_maintenance_notification_date` date DEFAULT NULL,
  `start_date` date NOT NULL,
  `status` enum('ACTIVE','CANCELLED','EXPIRED','PENDING') COLLATE utf8mb4_unicode_ci NOT NULL,
  `package_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`contract_id`),
  KEY `FKmq1wqmwel4vkdyfcfbkgm024n` (`package_id`),
  KEY `FK9c3t6cxp0x2fc71cbpy29xrpl` (`user_id`),
  CONSTRAINT `FK9c3t6cxp0x2fc71cbpy29xrpl` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `FKmq1wqmwel4vkdyfcfbkgm024n` FOREIGN KEY (`package_id`) REFERENCES `service_packages` (`package_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_package_contracts`
--

LOCK TABLES `customer_package_contracts` WRITE;
/*!40000 ALTER TABLE `customer_package_contracts` DISABLE KEYS */;
INSERT INTO `customer_package_contracts` VALUES (1,'Gói 1 năm','2026-11-23',NULL,'2025-11-23','PENDING',1,7);
/*!40000 ALTER TABLE `customer_package_contracts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_verification_tokens`
--

DROP TABLE IF EXISTS `email_verification_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_verification_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  `token` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKewmvysc7e9y6uy7og2c21axa9` (`token`),
  KEY `FKi1c4mmamlb8keqt74k4lrtwhc` (`user_id`),
  CONSTRAINT `FKi1c4mmamlb8keqt74k4lrtwhc` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_verification_tokens`
--

LOCK TABLES `email_verification_tokens` WRITE;
/*!40000 ALTER TABLE `email_verification_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `email_verification_tokens` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventories`
--

LOCK TABLES `inventories` WRITE;
/*!40000 ALTER TABLE `inventories` DISABLE KEYS */;
INSERT INTO `inventories` VALUES (1,'2025-11-23',5,99,'2025-11-23',2,1),(2,'2025-11-23',5,30,'2025-11-23',4,1),(3,'2025-11-23',5,15,'2025-11-23',10,1),(4,'2025-11-23',5,15,'2025-11-23',8,1),(5,'2025-11-23',5,30,'2025-11-23',5,1),(6,'2025-11-23',5,30,'2025-11-23',6,1),(7,'2025-11-23',5,30,'2025-11-23',11,1),(8,'2025-11-23',5,48,'2025-11-23',2,2),(9,'2025-11-23',5,40,'2025-11-23',3,2),(10,'2025-11-23',5,29,'2025-11-23',4,2),(11,'2025-11-23',5,29,'2025-11-23',6,2),(12,'2025-11-23',5,30,'2025-11-23',5,2),(13,'2025-11-23',5,30,'2025-11-23',7,2),(14,'2025-11-23',5,15,'2025-11-23',8,2),(15,'2025-11-23',5,13,'2025-11-23',10,2),(16,'2025-11-23',5,20,'2025-11-23',12,2),(17,'2025-11-23',5,15,'2025-11-23',9,2),(18,'2025-11-23',5,14,'2025-11-23',11,2),(19,'2025-11-23',5,20,'2025-11-23',12,1),(20,'2025-11-23',5,15,'2025-11-23',9,1);
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
  `invoice_date` datetime(6) NOT NULL,
  `payment_method` enum('BANK_TRANSFER','CASH','CREDIT_CARD','MOMO','UNSPECIFIED','VNPAY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_status` enum('CANCELLED','PAID','PENDING') COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_amount` double NOT NULL,
  `contract_id` int DEFAULT NULL,
  `ticket_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`invoice_id`),
  UNIQUE KEY `UKb46n151aehmo7ekv39o6b0pl5` (`ticket_id`),
  KEY `FKmnj7bejtnflnsxi1xqap88kvc` (`contract_id`),
  KEY `FKbwr4d4vyqf2bkoetxtt8j9dx7` (`user_id`),
  CONSTRAINT `FKbwr4d4vyqf2bkoetxtt8j9dx7` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `FKimen4lsicpbopj9w5qljlc0w9` FOREIGN KEY (`ticket_id`) REFERENCES `service_tickets` (`ticket_id`),
  CONSTRAINT `FKmnj7bejtnflnsxi1xqap88kvc` FOREIGN KEY (`contract_id`) REFERENCES `customer_package_contracts` (`contract_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES (1,'2025-11-23 11:04:37.912713','UNSPECIFIED','PENDING',1740000,1,NULL,7),(2,'2025-11-23 11:38:39.909738','UNSPECIFIED','PENDING',420000,NULL,1,7),(3,'2025-11-23 11:49:09.084758','UNSPECIFIED','PENDING',240000,NULL,4,7),(4,'2025-11-23 11:49:13.644063','UNSPECIFIED','PENDING',420000,NULL,3,9),(5,'2025-11-23 11:51:07.522793','UNSPECIFIED','PENDING',420000,NULL,2,8),(6,'2025-11-23 12:15:59.344643','UNSPECIFIED','PENDING',900000,NULL,6,10),(7,'2025-11-23 12:16:04.133072','UNSPECIFIED','PENDING',370000,NULL,5,9),(8,'2025-11-23 12:16:08.981467','UNSPECIFIED','PENDING',900000,NULL,7,8);
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
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'2025-11-23 11:24:51.591761',_binary '','Lịch hẹn #1 đã được nhân viên xác nhận. Vui lòng đến quầy và check-in lúc 13:04 ngày 2025-11-24.','Lịch hẹn của bạn đã được xác nhận!',7),(2,'2025-11-23 11:24:52.867908',_binary '','Lịch hẹn #2 đã được nhân viên xác nhận. Vui lòng đến quầy và check-in lúc 11:09 ngày 2025-11-26.','Lịch hẹn của bạn đã được xác nhận!',8),(3,'2025-11-23 11:24:55.012652',_binary '\0','Lịch hẹn #3 đã được nhân viên xác nhận. Vui lòng đến quầy và check-in lúc 04:20 ngày 2025-11-23.','Lịch hẹn của bạn đã được xác nhận!',9),(4,'2025-11-23 11:25:07.000770',_binary '','Bạn vừa được gán lịch hẹn #1 vào lúc 13:04 ngày 2025-11-24','Bạn có cuộc hẹn mới!',3),(5,'2025-11-23 11:37:38.705333',_binary '','Dịch vụ cho xe [30A-12345] (Phiếu #1) đã được hoàn thành. Vui lòng đợi thông báo hóa đơn để thanh toán.','Dịch vụ của bạn đã hoàn tất!',7),(6,'2025-11-23 11:37:38.708849',_binary '','Phiếu dịch vụ #1 (Khách: Phạm Ngọc Hùng Đức) đã được hoàn tất. Vui lòng kiểm tra và tạo hóa đơn.','Kỹ thuật viên đã hoàn thành công việc ',6),(7,'2025-11-23 11:38:39.922032',_binary '','Hóa đơn #2 với tổng số tiền 420000.0 đã được tạo. Vui lòng thanh toán.','Hóa đơn mới cho dịch vụ của bạn!',7),(8,'2025-11-23 11:42:59.457300',_binary '','Bạn vừa được gán lịch hẹn #2 vào lúc 11:09 ngày 2025-11-26','Bạn có cuộc hẹn mới!',2),(9,'2025-11-23 11:43:04.727319',_binary '\0','Bạn vừa được gán lịch hẹn #3 vào lúc 04:20 ngày 2025-11-23','Bạn có cuộc hẹn mới!',3),(10,'2025-11-23 11:43:55.044113',_binary '','Dịch vụ cho xe [51K-678.90] (Phiếu #2) đã được hoàn thành. Vui lòng đợi thông báo hóa đơn để thanh toán.','Dịch vụ của bạn đã hoàn tất!',8),(11,'2025-11-23 11:43:55.050028',_binary '','Phiếu dịch vụ #2 (Khách: Customer 01) đã được hoàn tất. Vui lòng kiểm tra và tạo hóa đơn.','Kỹ thuật viên đã hoàn thành công việc ',6),(12,'2025-11-23 11:44:51.697077',_binary '\0','Dịch vụ cho xe [43C1-101.12] (Phiếu #3) đã được hoàn thành. Vui lòng đợi thông báo hóa đơn để thanh toán.','Dịch vụ của bạn đã hoàn tất!',9),(13,'2025-11-23 11:44:51.698079',_binary '','Phiếu dịch vụ #3 (Khách: Customer 02) đã được hoàn tất. Vui lòng kiểm tra và tạo hóa đơn.','Kỹ thuật viên đã hoàn thành công việc ',6),(14,'2025-11-23 11:46:45.202292',_binary '','Lịch hẹn #4 đã được nhân viên xác nhận. Vui lòng đến quầy và check-in lúc 11:46 ngày 2025-11-23.','Lịch hẹn của bạn đã được xác nhận!',7),(15,'2025-11-23 11:46:49.595879',_binary '\0','Bạn vừa được gán lịch hẹn #4 vào lúc 11:46 ngày 2025-11-23','Bạn có cuộc hẹn mới!',3),(16,'2025-11-23 11:48:10.218478',_binary '','Dịch vụ cho xe [30A-12345] (Phiếu #4) đã được hoàn thành. Vui lòng đợi thông báo hóa đơn để thanh toán.','Dịch vụ của bạn đã hoàn tất!',7),(17,'2025-11-23 11:48:10.220514',_binary '','Phiếu dịch vụ #4 (Khách: Phạm Ngọc Hùng Đức) đã được hoàn tất. Vui lòng kiểm tra và tạo hóa đơn.','Kỹ thuật viên đã hoàn thành công việc ',6),(18,'2025-11-23 11:49:09.094888',_binary '\0','Hóa đơn #3 với tổng số tiền 240000.0 đã được tạo. Vui lòng thanh toán.','Hóa đơn mới cho dịch vụ của bạn!',7),(19,'2025-11-23 11:49:13.651830',_binary '\0','Hóa đơn #4 với tổng số tiền 420000.0 đã được tạo. Vui lòng thanh toán.','Hóa đơn mới cho dịch vụ của bạn!',9),(20,'2025-11-23 11:51:07.534647',_binary '','Hóa đơn #5 với tổng số tiền 420000.0 đã được tạo. Vui lòng thanh toán.','Hóa đơn mới cho dịch vụ của bạn!',8),(21,'2025-11-23 12:13:26.826783',_binary '','Lịch hẹn #5 đã được nhân viên xác nhận. Vui lòng đến quầy và check-in lúc 12:10 ngày 2025-11-23.','Lịch hẹn của bạn đã được xác nhận!',8),(22,'2025-11-23 12:13:27.700565',_binary '\0','Lịch hẹn #6 đã được nhân viên xác nhận. Vui lòng đến quầy và check-in lúc 12:11 ngày 2025-11-23.','Lịch hẹn của bạn đã được xác nhận!',9),(23,'2025-11-23 12:13:28.286170',_binary '\0','Lịch hẹn #7 đã được nhân viên xác nhận. Vui lòng đến quầy và check-in lúc 12:13 ngày 2025-11-23.','Lịch hẹn của bạn đã được xác nhận!',10),(24,'2025-11-23 12:13:35.280295',_binary '\0','Bạn vừa được gán lịch hẹn #5 vào lúc 12:10 ngày 2025-11-23','Bạn có cuộc hẹn mới!',4),(25,'2025-11-23 12:13:39.189408',_binary '\0','Bạn vừa được gán lịch hẹn #6 vào lúc 12:11 ngày 2025-11-23','Bạn có cuộc hẹn mới!',3),(26,'2025-11-23 12:13:43.214261',_binary '\0','Bạn vừa được gán lịch hẹn #7 vào lúc 12:13 ngày 2025-11-23','Bạn có cuộc hẹn mới!',3),(27,'2025-11-23 12:14:36.211889',_binary '\0','Dịch vụ cho xe [43C1-101.12] (Phiếu #5) đã được hoàn thành. Vui lòng đợi thông báo hóa đơn để thanh toán.','Dịch vụ của bạn đã hoàn tất!',9),(28,'2025-11-23 12:14:36.211889',_binary '\0','Phiếu dịch vụ #5 (Khách: Customer 02) đã được hoàn tất. Vui lòng kiểm tra và tạo hóa đơn.','Kỹ thuật viên đã hoàn thành công việc ',6),(29,'2025-11-23 12:15:13.542105',_binary '\0','Dịch vụ cho xe [29B1-567.89] (Phiếu #6) đã được hoàn thành. Vui lòng đợi thông báo hóa đơn để thanh toán.','Dịch vụ của bạn đã hoàn tất!',10),(30,'2025-11-23 12:15:13.542105',_binary '\0','Phiếu dịch vụ #6 (Khách: Customer 03) đã được hoàn tất. Vui lòng kiểm tra và tạo hóa đơn.','Kỹ thuật viên đã hoàn thành công việc ',6),(31,'2025-11-23 12:15:46.287345',_binary '','Dịch vụ cho xe [51K-678.90] (Phiếu #7) đã được hoàn thành. Vui lòng đợi thông báo hóa đơn để thanh toán.','Dịch vụ của bạn đã hoàn tất!',8),(32,'2025-11-23 12:15:46.287345',_binary '\0','Phiếu dịch vụ #7 (Khách: Customer 01) đã được hoàn tất. Vui lòng kiểm tra và tạo hóa đơn.','Kỹ thuật viên đã hoàn thành công việc ',6),(33,'2025-11-23 12:15:59.348893',_binary '\0','Hóa đơn #6 với tổng số tiền 900000.0 đã được tạo. Vui lòng thanh toán.','Hóa đơn mới cho dịch vụ của bạn!',10),(34,'2025-11-23 12:16:04.149443',_binary '\0','Hóa đơn #7 với tổng số tiền 370000.0 đã được tạo. Vui lòng thanh toán.','Hóa đơn mới cho dịch vụ của bạn!',9),(35,'2025-11-23 12:16:08.981467',_binary '','Hóa đơn #8 với tổng số tiền 900000.0 đã được tạo. Vui lòng thanh toán.','Hóa đơn mới cho dịch vụ của bạn!',8);
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
INSERT INTO `package_service_item` VALUES (1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(1,8),(1,9),(3,1),(3,2),(3,3),(3,4),(3,5),(3,6),(3,7),(3,8),(3,9),(2,1),(2,2),(2,3),(2,4),(2,5),(2,6),(2,7),(2,8),(2,9);
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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parts`
--

LOCK TABLES `parts` WRITE;
/*!40000 ALTER TABLE `parts` DISABLE KEYS */;
INSERT INTO `parts` VALUES (2,250000,'Má Phanh Đĩa (Bộ)',350000),(3,80000,'Má Phanh Cơ (Bộ)',120000),(4,140000,'Lọc Gió Điều Hòa',200000),(5,500000,'Lốp Xe Không Săm (Mẫu Phổ thông)',700000),(6,250000,'Lốp Xe Có Săm (Mẫu Cơ bản)',350000),(7,100000,'Bóng Đèn Pha LED',150000),(8,120000,'Dầu Hộp Số Giảm Tốc (1 lít)',180000),(9,180000,'Dung Dịch Nước Làm Mát Pin',250000),(10,600000,'Ắc Quy 12V Phụ (Lead-Acid)',850000),(11,190000,'Dây Curoa (Vành đai truyền động)',280000),(12,120000,'Hộp số tốc độ',180000);
/*!40000 ALTER TABLE `parts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  `token` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK71lqwbwtklmljk3qlsugr1mig` (`token`),
  KEY `FKk3ndxg5xp6v7wd4gjyusp15gq` (`user_id`),
  CONSTRAINT `FKk3ndxg5xp6v7wd4gjyusp15gq` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_centers`
--

LOCK TABLES `service_centers` WRITE;
/*!40000 ALTER TABLE `service_centers` DISABLE KEYS */;
INSERT INTO `service_centers` VALUES (1,'Số 2, đường Võ Oanh, phường 25, quận Bình Thạnh, tp.HCM','Trung Tâm Sửa Chữa Quận Bình Thạnh','Trungtam01@gmail.com','0396437386'),(2,'10 Đường 12, Bình Khánh, Thủ Đức, Thành phố Hồ Chí Minh','Trung Tâm Sửa Chữa Thủ Đức','Trungtam02@gmail.com','0396246727'),(3,'Đ. Nguyễn Trãi, P. Văn Quán, Nam Từ Liêm, Hà Nội','Trung Tâm Sửa Chữa Hà Nội','Trungtam03@gmail.com','0395467547');
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_items`
--

LOCK TABLES `service_items` WRITE;
/*!40000 ALTER TABLE `service_items` DISABLE KEYS */;
INSERT INTO `service_items` VALUES (1,'Kiểm tra  20 điểm an toàn cơ bản: phanh, lốp, đèn, còi, hệ thống lái, độ căng xích/dây curoa, kiểm tra pin 12V và rò rỉ dung dịch (nếu có).','Kiểm Tra Tổng Quát',50000),(2,'Tháo má phanh cũ, vệ sinh cụm phanh, lắp má phanh mới, điều chỉnh hành trình phanh.','Thay Má Phanh (Đĩa/Cơ)',70000),(3,'Bơm lốp theo đúng áp suất tiêu chuẩn của nhà sản xuất, kiểm tra độ mòn và hư hỏng bề mặt lốp.','Căn Chỉnh/Bơm Lốp',20000),(4,'Tháo lọc cũ, vệ sinh khoang lọc, lắp đặt lọc gió điều hòa mới.','Thay Lọc Gió Điều Hòa',40000),(5,'Phân tích tình trạng từng cell pin, thực hiện quy trình cân bằng cell để tối ưu hóa hiệu suất và tuổi thọ pin.','Kiểm Tra & Cân Bằng Pin',300000),(6,'Tháo ắc quy cũ, vệ sinh cực nối, lắp đặt ắc quy 12V mới, kiểm tra sạc.','Thay Ắc Quy 12V Phụ',50000),(7,'Tháo xả dầu cũ, vệ sinh ốc xả dầu, bơm dầu hộp số mới theo đúng tiêu chuẩn.','Thay Dầu Hộp Số Giảm Tốc',90000),(8,'Chẩn đoán và sửa chữa các lỗi đơn giản về điện (cầu chì, dây dẫn hở, đèn, còi). Tính phí theo giờ làm việc.','Sửa Chữa Hệ Thống Điện',150000),(9,'Kết nối máy chẩn đoán, kiểm tra và cài đặt phiên bản phần mềm mới nhất cho Bộ điều khiển (Controller) hoặc các hệ thống liên quan.','Cập Nhật Phần Mềm Hệ Thống',100000);
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_packages`
--

LOCK TABLES `service_packages` WRITE;
/*!40000 ALTER TABLE `service_packages` DISABLE KEYS */;
INSERT INTO `service_packages` VALUES (1,'',12,'Gói 1 năm',1740000),(2,'',24,'Gói 2 năm',6960000),(3,'',36,'Gói 3 năm',13920000);
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_tickets`
--

LOCK TABLES `service_tickets` WRITE;
/*!40000 ALTER TABLE `service_tickets` DISABLE KEYS */;
INSERT INTO `service_tickets` VALUES (1,'2025-11-23 11:37:38.698950','','2025-11-23 11:36:01.219502','COMPLETED',1,3),(2,'2025-11-23 11:43:55.038794','','2025-11-23 11:43:31.513340','COMPLETED',2,2),(3,'2025-11-23 11:44:51.694071','','2025-11-23 11:44:17.288225','COMPLETED',3,3),(4,'2025-11-23 11:48:10.214421','','2025-11-23 11:47:04.610625','COMPLETED',4,3),(5,'2025-11-23 12:14:36.208765','','2025-11-23 12:14:12.792182','COMPLETED',6,3),(6,'2025-11-23 12:15:13.542105','','2025-11-23 12:14:51.155283','COMPLETED',7,3),(7,'2025-11-23 12:15:46.287345','','2025-11-23 12:15:27.524115','COMPLETED',5,4);
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
INSERT INTO `technician_certificates` VALUES (2,'ABC-123','2030-10-26','2025-10-27','',1),(4,'ABC-234','2030-10-29','2025-10-30','',1),(3,'ABC-125','2030-10-26','2025-10-27','',2);
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
INSERT INTO `ticket_parts` VALUES (1,350000,2,1),(1,350000,2,2),(1,350000,2,3),(1,200000,4,4),(1,350000,6,5),(1,850000,10,6),(1,850000,10,7);
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
INSERT INTO `ticket_service_items` VALUES (0,70000,2,1),(0,70000,2,2),(0,70000,2,3),(0,20000,3,5),(0,40000,4,4),(0,50000,6,6),(0,50000,6,7);
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
  `base_salary` bigint DEFAULT NULL,
  `commission_rate` double DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `enabled` bit(1) NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,NULL,NULL,NULL,'2025-11-23 09:21:40.742549','phamngochungduc@gmail.com',_binary '','Hùng Đức','$2a$10$Fs6I.AG2sMJjEafqne3qOumaTkRePnfvz0QLj2Tdb10Rv7vtFnw0W',NULL,'ADMIN',NULL,'admin01',NULL),(2,NULL,NULL,NULL,'2025-11-23 09:49:29.747829','tech01@gmail.com',_binary '\0','Technician 01','$2a$10$TD9IP8CrycspXah/lUoNyOgCyww9LXFAXbTBMM7nlEaXOgNpZmJQW','0394374775','TECHNICIAN',NULL,'tech01',1),(3,NULL,NULL,NULL,'2025-11-23 09:50:35.471983','tech02@gmail.com',_binary '\0','Technician 02','$2a$10$KQYmyiBoa/lvIAl.AutFp.gVnZwYGYiScNZc3jCpe9626aiYlBM7y','0394374774','TECHNICIAN',NULL,'tech02',2),(4,NULL,NULL,NULL,'2025-11-23 09:52:17.154022','tech03@gmail.com',_binary '\0','Technician 03','$2a$10$mxe3Uwv0VDdTn7QHK0JJxu5racyffFyStZBITw6sGGmgtWDs1hgci','0394374772','TECHNICIAN',NULL,'tech03',2),(5,NULL,NULL,NULL,'2025-11-23 09:52:52.726155','staff01@gmail.com',_binary '\0','Staff 01','$2a$10$4DrTV1onFTv8kos4EWtzxuS1MBH50et6xllnaJ9pfxXNBq1iDJQta','0393643727','STAFF','2025-11-23 09:54:16.162826','STAFF',1),(6,NULL,NULL,NULL,'2025-11-23 09:53:35.527806','staff02@gmail.com',_binary '\0','Staff 02','$2a$10$nUzDsKiwdH.piwy6oyFPn.oltuU2mH7C0A5cshmFeo7BDb1iPF.6a','0394374771','STAFF',NULL,'staff02',2),(7,NULL,NULL,NULL,'2025-11-23 11:01:58.926121','ducpnh0577@ut.edu.vn',_binary '','Phạm Ngọc Hùng Đức','$2a$10$EyD3Zkm5WwXCUx0znYwwN.I5V9SmIkFmvFLwuE3vW5QprsgePCp.e','0900000001','CUSTOMER','2025-11-23 11:40:22.421005','duc123',NULL),(8,NULL,NULL,NULL,'2025-11-23 11:06:48.959204','phamduckun123456+acc1@gmail.com',_binary '','Customer 01','$2a$10$5UZ6t8apxqgFH/2RjdrrwenJosnSNSmayF.p8oqQvdhai5mSbsKRK','0900000002','CUSTOMER',NULL,'customer01',NULL),(9,NULL,NULL,NULL,'2025-11-23 11:10:54.368624','phamduckun123456+acc2@gmail.com',_binary '','Customer 02','$2a$10$2/7XgPRUV6JKKGNL/DZ.jOmYCfFjZDKX1qfBB32iY.CqTRO4EQim.','0900000003','CUSTOMER',NULL,'customer02',NULL),(10,NULL,NULL,NULL,'2025-11-23 11:30:35.977745','phamduckun123456+acc3@gmail.com',_binary '','Customer 03','$2a$10$t/6wUTNeM6V/w.2.yhAom.k2SXB8C0IYPklKpCwv.3E3kiHBMDfzC','0392762672','CUSTOMER','2025-11-23 11:33:46.494897','customer03',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicles`
--

LOCK TABLES `vehicles` WRITE;
/*!40000 ALTER TABLE `vehicles` DISABLE KEYS */;
INSERT INTO `vehicles` VALUES (1,'VinFast','30A-12345','VF e34','2025-11-23','ELECTRIC_MOTORBIKE',NULL,7),(2,'Porsche','51K-678.90','Taycan','2025-11-23','ELECTRIC_CAR',NULL,8),(3,'Pega','43C1-101.12','Newtech 3','2025-11-23','ELECTRIC_MOTORBIKE',NULL,9),(4,'VinFast','29B1-567.89','Klara S','2025-11-23','ELECTRIC_MOTORBIKE',NULL,10);
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

-- Dump completed on 2025-11-23 12:20:11
