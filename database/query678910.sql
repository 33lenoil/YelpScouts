USE yelp;

SELECT * FROM business WHERE business_id = 'ltBBYdNzkeKdCNPDAsxwAA';
# Query 8
# displays keywords from a business_id page
SELECT keyword1 FROM (
SELECT keyword1, COUNT(*) AS keyword1count
FROM keywords_tip
WHERE business_id = 'ltBBYdNzkeKdCNPDAsxwAA'
GROUP BY keyword1
ORDER BY keyword1count DESC LIMIT 4) t;

SELECT keyword1, COUNT(*) AS keyword1count
FROM keywords_tip
WHERE business_id = 'ltBBYdNzkeKdCNPDAsxwAA'
GROUP BY keyword1
ORDER BY keyword1count DESC LIMIT 4;

SELECT
    TRIM(SUBSTRING_INDEX(keywords1, ',', 1)) AS keyword1,
    CASE WHEN LENGTH(keywords1) - LENGTH(REPLACE(keywords1, ',', '')) >=1
        THEN TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(keywords1, ',', 2), ',', -1))
        ELSE NULL
        END AS keyword2,
    CASE WHEN LENGTH(keywords1) - LENGTH(REPLACE(keywords1, ',', '')) >=2
        THEN TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(keywords1, ',', 3), ',', -1))
        ELSE NULL
        END AS keyword3,
    CASE WHEN LENGTH(keywords1) - LENGTH(REPLACE(keywords1, ',', '')) >=3
        THEN TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(keywords1, ',', 4), ',', -1))
        ELSE NULL
        END AS keyword4
FROM (
    SELECT
    GROUP_CONCAT(keyword1 SEPARATOR ',') AS keywords1
FROM (
    SELECT keyword1, COUNT(*) AS keyword1count
    FROM keywords_tip
    WHERE business_id = 'ltBBYdNzkeKdCNPDAsxwAA'
    GROUP BY keyword1
    ORDER BY keyword1count DESC
    LIMIT 4) t
     ) keyrows;

# Frontend clicks on a keywords displayed on the (Query 8)
SELECT
   business_id,
   user_id,
   date,
   compliment_count,
   text
FROM tip
WHERE tip.business_id = 's6duVnqs03AmLMZ1NSW7nw'  AND LOWER(text) LIKE LOWER('%jesse%');




# Query 9 comparison to the average
-- Optimization 1: index
CREATE INDEX businessid ON business (business_id);
CREATE INDEX businessid ON reviews (business_id); # optimization

-- Optimization 2: caching
CREATE TABLE business_visits AS
SELECT c.business_id, COUNT(*) AS num_visits
FROM checkin c
GROUP BY c.business_id;
CREATE TABLE business_reviews AS
SELECT business_id,
      AVG(stars) AS avg_review_star,
      COUNT(*) AS total_reviews
FROM reviews
GROUP BY business_id;
CREATE TABLE business_stats AS
SELECT
   br.business_id,
   bv.num_visits,
   br.avg_review_star, # per business
   br.total_reviews
FROM business_reviews br JOIN business_visits bv ON br.business_id = bv.business_id;

SELECT
   bs.business_id,
   ROUND((bs.num_visits - a.avg_num_visits) / a.avg_num_visits,2)  * 100 AS num_visitor_offset,
   ROUND((bs.avg_review_star - a.avg_review_star) / a.avg_review_star,2) * 100 AS review_star_offset, -- per business
   ROUND((bs.total_reviews - a.avg_total_reviews) / a.avg_total_reviews,2) * 100 AS total_reviews_offset
FROM business_stats bs, (
-- average stats for all businesses.
SELECT
   AVG(business_stats.num_visits) AS avg_num_visits,
   AVG(business_stats.avg_review_star) AS avg_review_star, # across_business
   AVG(business_stats.total_reviews) AS avg_total_reviews
FROM business_stats) a
WHERE bs.business_id = '__Jhyl5p8bfnnYOGjwPtsg';




# universal Ranking Query 10

DROP ViEW business_keywords;
# display a list of businesses , ranked by keywords
CREATE VIEW business_keywords AS
SELECT
   business_id,
   RANK() OVER (ORDER BY quality_count DESC) AS quality_rank,
   RANK() OVER (ORDER BY service_count DESC) AS service_rank,
   RANK() OVER (ORDER BY ambiance_count DESC) AS ambiance_rank#,
   #RANK() OVER (ORDER BY price_count DESC) AS price_rank,
   #RANK() OVER (ORDER BY location_count DESC) AS location_rank
FROM (
   SELECT
       business_id,
       SUM(CASE WHEN LOWER(text) LIKE '%quality%' THEN 1 ELSE 0 END) AS quality_count,
       SUM(CASE WHEN LOWER(text) LIKE '%service%' THEN 1 ELSE 0 END) AS service_count,
       SUM(CASE WHEN LOWER(text) LIKE '%ambiance%' THEN 1 ELSE 0 END) AS ambiance_count#,
       #SUM(CASE WHEN LOWER(text) LIKE '%price%' THEN 1 ELSE 0 END) AS price_count,
       #SUM(CASE WHEN LOWER(text) LIKE '%location%' THEN 1 ELSE 0 END) AS location_count
   FROM tip
   # Optimization 1: get only the necessary rows to reduce size
   WHERE LOWER(text) LIKE '%quality%' OR LOWER(text) LIKE '%service%' OR LOWER(text) LIKE '%ambiance%' #OR LOWER(text) LIKE '%price%' OR LOWER(text) LIKE '%location%'
   GROUP BY business_id
) AS keyword_counts;

# Optimization 2: using index to ease up joins later
CREATE INDEX businessid ON business_visits (business_id);
# The checks table combines the number of reviews and the number of customer check-ins/visits as a popularity metric
CREATE TABLE checks AS
SELECT
   visit_counts.business_id,
   visit_counts.num_visits,
   review_counts.total_reviews AS num_reviews,
   visit_counts.num_visits + review_counts.total_reviews AS visits_reviews
FROM business_visits visit_counts
    JOIN business_reviews AS review_counts ON visit_counts.business_id = review_counts.business_id;
# Optimization 3: using index for joins later
CREATE INDEX business_id ON checks(business_id);
# normal
DROP VIEW normalized_business_checkins;
CREATE VIEW normalized_business_checkins AS
SELECT
   c.business_id,
   (c.visits_reviews -
    (SELECT MIN(visits_reviews) FROM checks ck) ) /
   ((SELECT MAX(visits_reviews) FROM checks ck)  - (SELECT MIN(visits_reviews) FROM checks ck)) AS normalized_visits_reviews
FROM
   checks c
ORDER BY normalized_visits_reviews DESC LIMIT 120; # Optimization 4: reduce the size before later joins.
# Optimization 5: using index for joins later
CREATE INDEX businessid ON category(business_id);
SELECT
   b.business_id,
   b.name,
   b.address,
   b.city,
   b.stars,
   c.first_category,
   nbc.normalized_visits_reviews,
   b.stars/(1-nbc.normalized_visits_reviews) AS ind, # the higher index, the better
   quality_rank,
   ambiance_rank,
   service_rank
FROM business b
    JOIN category c ON b.business_id = c.business_id
   JOIN normalized_business_checkins nbc ON b.business_id = nbc.business_id
   JOIN business_keywords bk ON b.business_id = bk.business_id
ORDER BY ind DESC, quality_rank DESC, ambiance_rank DESC, service_rank DESC# we can add more features if join more tables
LIMIT 100;


# smaller quries
# Query 6
SELECT user_id FROM user_credentials WHERE user_name = 'eva' AND user_password = '123456';

-- Add a user (Query 7)
INSERT INTO user_credentials (user_name, user_password) VALUES ('eva', '123456');
SELECT user_id FROM user_credentials WHERE user_name = 'eva' AND user_password = '123456';
SELECT user_password FROM user_credentials WHERE user_name = 'eva' OR user_id = '1';

DROP VIEW BusinessInfo;
CREATE VIEW BusinessInfo AS
SELECT
    b.business_id, b.name, b.address, b.city, b.state, b.postal_code, b.latitude, b.longitude,
    b.stars AS initial_stars_rating,
    ROUND(AVG(r.stars),2) AS avg_stars_rating,
    COUNT(r.review_id) AS review_count,
    c.first_category as category,
    b.is_open
FROM business b
LEFT JOIN category c ON b.business_id = c.business_id
LEFT JOIN reviews r ON b.business_id = r.business_id
GROUP BY b.business_id;

SELECT *
FROM BusinessInfo
WHERE city = '<city>' AND state = '<state>';

SELECT *
FROM BusinessInfo
WHERE name LIKE '%<name>%';

SELECT *
FROM BusinessInfo
WHERE category LIKE '%<category>%'
AND avg_stars_rating >= 4;

SELECT * FROM keywords_tip WHERE keyword1 IS NULL;