-- MySQL dump 10.13  Distrib 8.0.22, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: duoduo
-- ------------------------------------------------------
-- Server version	8.0.22

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
-- Table structure for table `stores`
--

DROP TABLE IF EXISTS `stores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stores` (
  `store_id` int NOT NULL AUTO_INCREMENT,
  `store_name` varchar(50) DEFAULT NULL,
  `vendor_name` varchar(50) DEFAULT NULL,
  `vendor_id` int DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `store_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`store_id`),
  KEY `vendor_id` (`vendor_id`),
  CONSTRAINT `stores_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`vendor_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stores`
--

LOCK TABLES `stores` WRITE;
/*!40000 ALTER TABLE `stores` DISABLE KEYS */;
INSERT INTO `stores` VALUES (1,'Second hand clothese','regina',1,'D:\\WAD\\CW-Code\\Project-DUODUO\\Databases\\Stores\\Second hand clothese\\LOGO\\Cache_-8798eb2e3467c4f..jpg','D:\\WAD\\CW-Code\\Project-DUODUO\\Databases\\Stores\\Second hand clothese'),(2,'Gundam home','Gundam',2,'D:\\WAD\\CW-Code\\Project-DUODUO\\Databases\\Stores\\Gundam home\\LOGO\\0111775a9abd19a801219586bae286.JPG@2o.jpg','D:\\WAD\\CW-Code\\Project-DUODUO\\Databases\\Stores\\Gundam home'),(3,'Comic Shop','ComicShop',3,'D:\\WAD\\CW-Code\\Project-DUODUO\\Databases\\Stores\\Comic Shop\\LOGO\\OIP-C.jpg','D:\\WAD\\CW-Code\\Project-DUODUO\\Databases\\Stores\\Comic Shop'),(4,'Batman Family','Batmanfamily',4,'D:\\WAD\\CW-Code\\Project-DUODUO\\Databases\\Stores\\Batman Family\\LOGO\\R-C.jpg','D:\\WAD\\CW-Code\\Project-DUODUO\\Databases\\Stores\\Batman Family'),(5,'CDUT Book Town','cdutBookTown',5,'D:\\WAD\\CW-Code\\Project-DUODUO\\Databases\\Stores\\CDUT Book Town\\LOGO\\OIP-C (1).jpg','D:\\WAD\\CW-Code\\Project-DUODUO\\Databases\\Stores\\CDUT Book Town'),(6,'Carl Bag','Carlbag',6,'D:\\WAD\\CW-Code\\Project-DUODUO\\Databases\\Stores\\Carl Bag\\LOGO\\R-C (1).jpg','D:\\WAD\\CW-Code\\Project-DUODUO\\Databases\\Stores\\Carl Bag');
/*!40000 ALTER TABLE `stores` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-06-04 21:08:26
