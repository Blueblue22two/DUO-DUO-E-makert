-- show tables;
create schema DUODUO;
SET FOREIGN_KEY_CHECKS=0; 

DROP TABLE IF exists customers;
CREATE TABLE customers (
customer_id INT PRIMARY KEY AUTO_INCREMENT,
customername VARCHAR(50),
password VARCHAR(50),
address VARCHAR(255),
email VARCHAR(50),
phone VARCHAR(20)
);

DROP TABLE IF exists vendors;
CREATE TABLE vendors (
vendor_id INT PRIMARY KEY AUTO_INCREMENT,
vendor_name VARCHAR(50),
password VARCHAR(50),
address VARCHAR(255),
email VARCHAR(50),
phone VARCHAR(20),
UNIQUE (vendor_id) -- add unique constrain
);

DROP TABLE IF exists products;
CREATE TABLE products (
product_id INT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100),
description text,
price DECIMAL(10, 1),
store_id INT,
FOREIGN KEY (store_id) REFERENCES stores(store_id),
category_name VARCHAR(50),
promotion_id INT,
image_url varchar(255),
image1_url VARCHAR(255),
likes INT,
dislikes INT
);

DROP TABLE IF exists comments;
CREATE TABLE comments(
comment_id INT primary KEY AUTO_INCREMENT,
tims DATE, -- get the current time year/month/day
content TEXT,
customername VARCHAR(50),
customer_id INT,
FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
product_id INT,
FOREIGN KEY (product_id) REFERENCES products(product_id)
);

DROP TABLE IF exists purchase_record;
CREATE TABLE purchase_record (
purchase_id INT PRIMARY KEY AUTO_INCREMENT,
customer_id INT,
FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
vendor_id INT,
FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id),
product_id INT,
FOREIGN KEY (product_id) REFERENCES products(product_id),
date DATE,
numbers int,
price DECIMAL(10,1),
status BOOLEAN NOT NULL DEFAULT false,
courier_number INT,
courier_company_name varchar(50),
tracking_info TEXT, -- Displays information about the current location of the item
delivery_time DATETIME 
);

DROP TABLE IF exists cart;
CREATE TABLE cart (
cart_id INT PRIMARY KEY AUTO_INCREMENT, -- cart_id is equal to customer_id
customer_id INT UNIQUE,
FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- Record the relationship between the item and the shopping cart
DROP TABLE IF exists cart_items;
CREATE TABLE cart_items (
cart_id INT,
FOREIGN KEY (cart_id) REFERENCES cart(cart_id),
product_id INT,
FOREIGN KEY (product_id) REFERENCES products(product_id),
quantity INT
);

DROP TABLE IF exists stores;
CREATE TABLE stores (
  store_id INT PRIMARY KEY AUTO_INCREMENT,
  store_name VARCHAR(50),
  vendor_name VARCHAR(50),
  vendor_id INT,
  image_url VARCHAR(255), -- path of logo image file
  store_url VARCHAR(255), -- path of store file
  FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id) ON DELETE CASCADE
);

DROP TABLE IF exists discount_promotion;
CREATE TABLE discount_promotion(
promotion_id INT PRIMARY KEY AUTO_INCREMENT,
store_id INT,
FOREIGN KEY (store_id) REFERENCES stores(store_id),
product_id INT,
FOREIGN KEY (product_id) REFERENCES products(product_id),
start_date DATE,
end_date DATE,
new_price DECIMAL(10, 1)
);

DROP TABLE IF exists message;
CREATE TABLE message(
message_id INT PRIMARY KEY AUTO_INCREMENT,
vendor_id INT NOT NULL, 
customer_id INT NOT NULL, 
product_name VARCHAR(100) NOT NULL,
content TEXT NOT NULL, 
send_time DATETIME DEFAULT CURRENT_TIMESTAMP, -- time
FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id)
);


