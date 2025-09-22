SHOW DATABASES;
# This file creates all tables and converts them to 3nf
#CREATE DATABASE yelp;

USE yelp;


DROP TABLE user_credentials;
CREATE TABLE user_credentials (
    user_id INT NOT NULL AUTO_INCREMENT,
    user_name VARCHAR(255),
    user_password VARCHAR(50),
    PRIMARY KEY (user_id, user_name)
);

DROP TABLE user_searchs;
CREATE TABLE user_searchs (
    search_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    business_id VARCHAR(22),
    FOREIGN KEY (business_id) REFERENCES business(business_id),
    FOREIGN KEY (user_id) REFERENCES user_credentials(user_id)
);
INSERT INTO user_searchs(user_id, business_id) VALUES ('1', 'pym7c6ZFEtmoH16xN2ApBg');
SELECT * FROM user_searchs;


# create tables, initial un-preprocessed tables
# create tables for the business related data
#DROP TABLE IF EXISTS business;
# 150263
CREATE TABLE business (
    `business_id` VARCHAR(22) PRIMARY KEY NOT NULL,
    `name` VARCHAR(255),
    `address` VARCHAR(255),
    `city` VARCHAR(255),
    `state` VARCHAR(255),
    `postal_code` VARCHAR(255),
    `latitude` FLOAT,
    `longitude` FLOAT,
    `stars` FLOAT,
    `review_count` INTEGER,
    `is_open` INTEGER
);

DROP TABLE IF EXISTS keywords_tip;
CREATE TABLE keywords_tip (
    tipping_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    business_id VARCHAR(22),
    text TEXT,
    keyword1 VARCHAR(255),
    keyword2 VARCHAR(255),
    keyword3 VARCHAR(255),
    keyword4 VARCHAR(255),
    polarity FLOAT,
    subjectivity FLOAT
);
ALTER TABLE keywords_tip
ADD CONSTRAINT key_2_business
FOREIGN KEY (business_id)
REFERENCES business(business_id);

UPDATE keywords_tip
SET
    keyword1 = TRIM(TRIM(BOTH '.' FROM keyword1)),
    keyword2 = TRIM(TRIM(BOTH '.' FROM keyword2)),
    keyword3 = TRIM(TRIM(BOTH '.' FROM keyword3)),
    keyword4 = TRIM(TRIM(BOTH '.' FROM keyword4));

UPDATE keywords_tip
SET
    keyword1 = TRIM(TRIM(BOTH '!' FROM keyword1)),
    keyword2 = TRIM(TRIM(BOTH '!' FROM keyword2)),
    keyword3 = TRIM(TRIM(BOTH '!' FROM keyword3)),
    keyword4 = TRIM(TRIM(BOTH '!' FROM keyword4));

UPDATE keywords_tip
SET
    keyword1 = TRIM(TRIM(BOTH '?' FROM keyword1)),
    keyword2 = TRIM(TRIM(BOTH '?' FROM keyword2)),
    keyword3 = TRIM(TRIM(BOTH '?' FROM keyword3)),
    keyword4 = TRIM(TRIM(BOTH '?' FROM keyword4));

UPDATE keywords_tip
SET
    keyword1 = TRIM(TRIM(BOTH ':' FROM keyword1)),
    keyword2 = TRIM(TRIM(BOTH ':' FROM keyword2)),
    keyword3 = TRIM(TRIM(BOTH ':' FROM keyword3)),
    keyword4 = TRIM(TRIM(BOTH ':' FROM keyword4));

SELECT keyword1, COUNT(*) AS keyword1count FROM keywords_tip
WHERE business_id = 'ltBBYdNzkeKdCNPDAsxwAA'
GROUP BY keyword1
ORDER BY keyword1count DESC LIMIT 4;

ALTER TABLE keywords_tip
DROP COLUMN text;

ALTER TABLE keywords_tip
DROP COLUMN polarity;
ALTER TABLE keywords_tip
DROP COLUMN subjectivity;


DROP TABLE IF EXISTS hour_original; #!!! # not 1NF since json is aggregated!!!
# filled
CREATE TABLE hour_original (
    business_id VARCHAR(22) PRIMARY KEY NOT NULL,
    hours TEXT,
    FOREIGN KEY (business_id) REFERENCES business(business_id)
    -- Note: You may want to add specific fields for days of the week and open/close times
);

DROP TABLE IF EXISTS hour_clean;
CREATE TEMPORARY TABLE hour_clean
SELECT business_id,
       CONCAT('[', REPLACE(REPLACE(hours, '\'', '"'), ', ', ','), ']') AS hour
FROM hour_original;
# convert text into json
DROP TEMPORARY TABLE IF EXISTS hour_json;
CREATE TEMPORARY TABLE hour_json
SELECT
    n.business_id,
    h.*
FROM
    hour_clean n,
    JSON_TABLE(
         n.hour,
         '$[*]'
         COLUMNS(
            monday TEXT PATH '$.Monday' NULL ON EMPTY ERROR ON ERROR,
            tuesday TEXT PATH '$.Tuesday' NULL ON EMPTY ERROR ON ERROR ,
            wednesday TEXT PATH'$.Wednesday' NULL ON EMPTY NULL ON ERROR,
            thursday TEXT PATH '$.Thursday' NULL ON EMPTY NULL ON ERROR,
            friday TEXT PATH  '$.Friday' NULL ON EMPTY NULL ON ERROR,
            saturday TEXT PATH'$.Saturday' NULL ON EMPTY NULL ON ERROR,
            sunday TEXT PATH '$.Sunday' NULL ON EMPTY NULL ON ERROR
    )
) as h;
# now omitted: extract json values from json string
CREATE TEMPORARY TABLE tmp1 (id INT, all_keys JSON)
SELECT business_id,
       JSON_VALUE(hours, '$.Monday') AS monday,
        JSON_VALUE(hours, '$.Tuesday') AS tuesday,
        JSON_VALUE(hours, '$.Wednesday') AS wednesday,
        JSON_VALUE(hours, '$.Thursday') AS thursday,
        JSON_VALUE(hours, '$.Friday') AS friday,
        JSON_VALUE(hours, '$.Saturday') AS saturday,
        JSON_VALUE(hours, '$.Sunday') AS sunday
FROM hour_original ;
CREATE TABLE hour
SELECT
    business_id,
    STR_TO_DATE(SUBSTRING(monday, 1, LOCATE('-', monday) - 1), '%H:%i') AS monday_open,
    STR_TO_DATE(SUBSTRING(monday, LOCATE('-', monday) + 1), '%H:%i') AS monday_close,
    STR_TO_DATE(SUBSTRING(tuesday, 1, LOCATE('-', tuesday) - 1), '%H:%i') AS tuesday_open,
    STR_TO_DATE(SUBSTRING(tuesday, LOCATE('-', tuesday) + 1), '%H:%i') AS tuesday_close,
    STR_TO_DATE(SUBSTRING(wednesday, 1, LOCATE('-', wednesday) - 1), '%H:%i') AS wednesday_open,
    STR_TO_DATE(SUBSTRING(wednesday, LOCATE('-', wednesday) + 1), '%H:%i') AS wednesday_close,
    STR_TO_DATE(SUBSTRING(thursday, 1, LOCATE('-', thursday) - 1), '%H:%i') AS thursday_open,
    STR_TO_DATE(SUBSTRING(thursday, LOCATE('-', thursday) + 1), '%H:%i') AS thursday_close,
    STR_TO_DATE(SUBSTRING(friday, 1, LOCATE('-', friday) - 1), '%H:%i') AS friday_open,
    STR_TO_DATE(SUBSTRING(friday, LOCATE('-', friday) + 1), '%H:%i') AS friday_close,
    STR_TO_DATE(SUBSTRING(saturday, 1, LOCATE('-', saturday) - 1), '%H:%i') AS saturday_open,
    STR_TO_DATE(SUBSTRING(saturday, LOCATE('-', saturday) + 1), '%H:%i') AS saturday_close,
    STR_TO_DATE(SUBSTRING(sunday, 1, LOCATE('-', sunday) - 1), '%H:%i') AS sunday_open,
    STR_TO_DATE(SUBSTRING(sunday, LOCATE('-', sunday) + 1), '%H:%i') AS sunday_close
FROM hour_json;

ALTER TABLE hour
ADD CONSTRAINT hour_2_business
FOREIGN KEY (business_id)
REFERENCES business(business_id);

DROP TEMPORARY TABLE tmp1;
DROP TEMPORARY TABLE hour_clean;
DROP TEMPORARY TABLE hour_json;


DROP TABLE IF EXISTS  category_original;
# filled
CREATE TABLE category_original (
    business_id VARCHAR(22) PRIMARY KEY NOT NULL,
    categories TEXT,
    FOREIGN KEY (business_id) REFERENCES business(business_id)
);

# make 1nf
CREATE TABLE category
SELECT
    business_id,
    TRIM(SUBSTRING_INDEX(categories, ', ', 1)) AS first_category,
    CASE WHEN LENGTH(categories) - LENGTH(REPLACE(categories, ',', '')) >=1
        THEN TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(categories, ', ', 2), ', ', -1))
        ELSE NULL
        END AS second_category,
    CASE WHEN LENGTH(categories) - LENGTH(REPLACE(categories, ',', '')) >=2
        THEN TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(categories, ', ', 3), ', ', -1))
        ELSE NULL
        END AS third_category,
    CASE WHEN LENGTH(categories) - LENGTH(REPLACE(categories, ',', '')) >=3
        THEN TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(categories, ', ', 4), ', ', -1))
        ELSE NULL
        END AS fourth_category,
    CASE WHEN LENGTH(categories) - LENGTH(REPLACE(categories, ',', '')) >=4
        THEN TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(categories, ', ', 5), ', ', -1))
        ELSE NULL
        END AS fifth_category
FROM category_original;

ALTER TABLE category
ADD CONSTRAINT cate_2_business
FOREIGN KEY (business_id)
REFERENCES business(business_id);

# create tables, initial un-preprocessed tables, not sure if it's in 1NF
# create tables for the checkin related data
DROP TABLE IF EXISTS checkin_original;
# filled
CREATE TABLE checkin_original(
    `business_id` VARCHAR(22) PRIMARY KEY NOT NULL,
    `date` TEXT,
     FOREIGN KEY (business_id) REFERENCES business(business_id)
);
# make 1nf
DROP TABLE IF EXISTS tmp1;
CREATE TEMPORARY TABLE tmp1
SELECT
    business_id,
    CONCAT('["', REPLACE(date, ', ', '","'), '"]') AS json_string
FROM checkin_original;

# each row is business_id + one of its checkin dates. To count, we need to aggregate.
CREATE TABLE checkin
SELECT
    n.business_id,
    h.*
FROM
    tmp1 n,
     JSON_TABLE(
         n.json_string,
         '$[*]'
         COLUMNS(
           date DATETIME PATH '$'
         )
       ) as h;

ALTER TABLE checkin
ADD CONSTRAINT fk_business_id
FOREIGN KEY (business_id)
REFERENCES business(business_id);

ALTER TABLE checkin
ADD COLUMN checkin_id INT AUTO_INCREMENT PRIMARY KEY;


# create tables for the tip related data
#DROP TABLE IF EXISTS tip;
CREATE TABLE tip (
    `user_id` VARCHAR(22),
    `business_id` VARCHAR(22),
    `text` TEXT,
    `date` DATETIME,
    `compliment_count` INTEGER,  -- Added a comma here
    PRIMARY KEY (`user_id`, `business_id`, `date`),
    FOREIGN KEY (business_id) REFERENCES business (business_id)  -- Assuming `attribute` is the correct table name
);

ALTER TABLE tip
ADD CONSTRAINT tip_key PRIMARY KEY (`user_id`, `business_id`, `date`, `compliment_count`);


#DROP TABLE IF EXISTS reviews;
# filled
CREATE TABLE reviews (
    review_id VARCHAR(22) PRIMARY KEY,
    user_id VARCHAR(22),
    business_id VARCHAR(22),
    stars FLOAT,
    useful INTEGER,
    funny INTEGER,
    cool INTEGER,
    #text  TEXT,
    date TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES business(business_id)
);

# Summary Statistics:
SELECT max(stars) AS MAX, min(stars) AS MIN, ROUND(avg(stars),2) AS AVG, ROUND(std(stars),2) AS STD FROM business
UNION
SELECT max(review_count), min(review_count), ROUND(avg(review_count),2), ROUND(std(review_count),2) FROM business
UNION
SELECT max(is_open), min(is_open), ROUND(avg(is_open),2), ROUND(std(is_open),2) FROM business;

SELECT state, COUNT(state) AS frequency
FROM business
GROUP BY state
ORDER BY frequency DESC LIMIT 5;

SELECT city, COUNT(city) AS frequency
FROM business
GROUP BY city
ORDER BY frequency DESC LIMIT 5;

SELECT first_category, COUNT(first_category) AS frequency
FROM category
GROUP BY first_category
ORDER BY frequency DESC LIMIT 5;

SELECT * FROM reviews;

SELECT max(stars) AS MAX, min(stars) AS MIN, ROUND(avg(stars),2) AS AVG, ROUND(std(stars),2) AS STD FROM reviews
UNION
SELECT max(useful) AS MAX, min(useful) AS MIN, ROUND(avg(useful),2) AS AVG, ROUND(std(useful),2) AS STD FROM reviews
UNION
SELECT max(funny) AS MAX, min(funny) AS MIN, ROUND(avg(funny),2) AS AVG, ROUND(std(funny),2) AS STD FROM reviews
UNION
SELECT max(cool) AS MAX, min(cool) AS MIN, ROUND(avg(cool),2) AS AVG, ROUND(std(cool),2) AS STD FROM reviews
UNION
SELECT max(date) AS MAX, min(date) AS MIN, 'no average for date', 'no std for dates'  FROM reviews
;

SELECT max(date), min(date)
FROM checkin;

SELECT MAX(number_of_checkins), MIN(number_of_checkins), AVG(number_of_checkins), STD(number_of_checkins)
FROM (
SELECT business_id,
       COUNT(*) as number_of_checkins FROM checkin
GROUP BY business_id) a;

SELECT max(compliment_count) AS MAX, min(compliment_count) AS MIN,
       ROUND(avg(compliment_count),2) AS AVG, ROUND(std(compliment_count),2) AS STD FROM tip;

SELECT max(date), min(date)
FROM tip;
