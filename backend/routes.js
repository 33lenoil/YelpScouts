const mysql = require('mysql')
const config = require('./config.json')

const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db,
  multipleStatements: true
});
connection.connect((err) => err && console.log(err));

// Route: POST "/businessSearch"
const businessSearch = async function (req, res) {
  const {
    userId,
    name,
    city,
    state,
    postal_code,
    stars_low,
    stars_high,
    category
  } = req.body;
  const page = req.query.page;
  const pageSize = req.query.page_size;
  // console.log(req);

  // the query for selecting from the view created
  // it's out here because some of the query parameters are optional
  let selectQuery = `SELECT * FROM BusinessInfo WHERE avg_stars_rating >= ${stars_low} AND avg_stars_rating <= ${stars_high}`;
  if (name !== "") {
    selectQuery += ` AND name LIKE '%${name}%'`;
  }

  if (city !== "") {
    selectQuery += ` AND city = '${city}'`;
  }

  if (state !== "" && state != "ALL") {
    selectQuery += ` AND state = '${state}'`;
  }

  if (postal_code !== 0) {
    selectQuery += ` AND postal_code = '${postal_code}'`;
  }

  if (category !== "") {
    selectQuery += ` AND category LIKE '%${category}%'`;
  }

  selectQuery += ` ORDER BY avg_stars_rating DESC LIMIT ${pageSize} OFFSET ${page * pageSize - pageSize};`;


  connection.query(`
  DROP VIEW IF EXISTS BusinessInfo;
  CREATE VIEW BusinessInfo AS
    SELECT
      b.business_id,
      b.name,
      b.address,
      b.city,
      b.state,
      b.postal_code,
      b.latitude,
      b.longitude,
      b.stars AS initial_stars_rating,
    ROUND(AVG(r.stars), 2) AS avg_stars_rating,
    COUNT(r.review_id) AS review_count,
    c.first_category as category,
    b.is_open
  FROM business b
  LEFT JOIN category c ON b.business_id = c.business_id
  LEFT JOIN reviews r ON b.business_id = r.business_id
  GROUP BY b.business_id;
  `, (err, data) => {
    if (err) {
      console.log(err);
      res.status(404).json({});
    } else {
      connection.query(selectQuery, (err, data) => {
        if (err) {
          console.log(err);
          res.status(404).json({});
        } else {
          console.log(data);
          for (let i = 0; i < data.length; i++) {
            connection.query(`INSERT INTO user_searchs(user_id, business_id) VALUES (${userId}, '${data[i].business_id}');`);
          }
          res.status(200).json({ businesses: data });
        }
      })
    }
  });
}

// Route: GET "/businessRec"
const businessRec = async function (req, res) {
  const { userId } = req.body;
  const page = req.query.page;
  const pageSize = req.query.page_size;

  connection.query(`
  DROP VIEW IF EXISTS yelp.business_score;
CREATE VIEW yelp.business_score AS
WITH business_avg AS (
SELECT bs.business_id, bs.num_visits attr1, bs.avg_review_star attr2, bs.total_reviews attr3
FROM yelp.business_stats bs),
normalization_metric AS (
SELECT AVG(attr1) avg_attr1, STDDEV(attr1) std_attr1, AVG(attr2) avg_attr2, STDDEV(attr2) std_attr2, AVG(attr3) avg_attr3, STDDEV(attr3) std_attr3
FROM business_avg
)
SELECT business_id, (1/3)*((attr1-avg_attr1)/std_attr1) + (1/3)*((attr2-avg_attr2)/std_attr2) + (1/3)*((attr3-avg_attr3)/std_attr3) AS score
FROM yelp.business_avg
CROSS JOIN normalization_metric;

DROP VIEW IF EXISTS yelp.user_table;
CREATE VIEW yelp.user_table AS
SELECT us.business_id, score, city, state
FROM yelp.user_searchs us
JOIN yelp.business_score bs
ON us.business_id = bs.business_id
JOIN yelp.business ON us.business_id = business.business_id
WHERE us.user_id = ${userId}
ORDER BY us.search_id DESC
LIMIT 1;

SELECT b.business_id, b.name, b.address, b.city, b.state, b.postal_code, ROUND(b_stats.avg_review_star, 2) AS avg_review_star, abs(bs.score - ut.score) recommendation_score
FROM yelp.business_score bs
JOIN yelp.business b
ON bs.business_id = b.business_id
JOIN yelp.user_table ut
ON ut.city = b.city AND ut.state = b.state AND ut.business_id != bs.business_id
JOIN yelp.business_stats b_stats
ON b_stats.business_id = b.business_id
ORDER BY recommendation_score ASC
LIMIT ${pageSize} OFFSET ${page * pageSize - pageSize};
  `, req.params.user_id, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      console.log(data[4]);
      res.status(200).json({ businesses: data[4] });
    }
  });
}

// Route: GET "/business/:businessId"
const businessById = async function (req, res) {
  const businessId = req.params.businessId;
  const highlightedKeyword = req.query.highlightedKeyword;
  console.log('businessId is:');
  console.log(businessId);
  connection.query(`
    SELECT name, address, city, state, postal_code, stars, is_open
    FROM business
    WHERE business_id = '${businessId}';
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.status(404).json({});
    } else {
      const reservation_availability = data[0].is_open === 1 ? "Reservation available" : "Reservation not available";
      let resJson = {
        name: data[0].name,
        address: data[0].address,
        city: data[0].city,
        state: data[0].state,
        postal_code: data[0].postal_code,
        stars: data[0].stars,
        reservation_availability: reservation_availability
      };
      // find avg and offset
      connection.query(`
        SELECT
          AVG(business_stats.num_visits) AS avg_num_visits,
          AVG(business_stats.avg_review_star) AS avg_review_star,
          AVG(business_stats.total_reviews) AS avg_total_reviews
        FROM business_stats;
      `, (err, data) => {
        if (err || data.length === 0) {
          console.log(err);
          res.status(404).json({});
        } else {
          // store results of this previous query
          const avg_num_visits = data[0].avg_num_visits;
          const avg_review_star = data[0].avg_review_star;
          const avg_total_reviews = data[0].avg_total_reviews;
          resJson.avg_num_visits = data[0].avg_num_visits;
          resJson.avg_review_star = data[0].avg_review_star;
          resJson.avg_total_reviews = data[0].avg_total_reviews;
          connection.query(`
            SELECT
              bs.business_id,
              ROUND(((bs.num_visits - '${avg_num_visits}') / '${avg_num_visits}') * 100, 0) AS num_visitor_offset,
              ROUND(((bs.avg_review_star - '${avg_review_star}') / '${avg_review_star}') * 100, 0) AS review_star_offset, -- per business
              ROUND(((bs.total_reviews - '${avg_total_reviews}') / '${avg_total_reviews}') * 100, 0) AS total_reviews_offset
            FROM business_stats bs
            WHERE bs.business_id = '${businessId}';
          `, (err, data) => {
            if (err || data.length === 0) {
              console.log(err);
              res.status(404).json({});
            } else {
              console.log("Setting offsets in resJson");
              resJson.num_visitor_offset = Math.abs(data[0].num_visitor_offset);
              resJson.review_star_offset = Math.abs(data[0].review_star_offset);
              resJson.total_reviews_offset = Math.abs(data[0].total_reviews_offset);
              resJson.num_visitor_offset_more_less = (data[0].num_visitor_offset >= 0) ? "more" : "less";
              resJson.review_star_offset_more_less = (data[0].review_star_offset >= 0) ? "more" : "less";
              resJson.total_reviews_offset_more_less = (data[0].total_reviews_offset >= 0) ? "more" : "less";
              connection.query(`
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
                    WHERE business_id = '${businessId}'
                    GROUP BY keyword1
                    ORDER BY keyword1count DESC
                    LIMIT 4
                  ) t
                ) keyrows;
              `, (err, data) => {
                if (err) {
                  console.log(err);
                  res.status(404).json({});
                } else {
                  if (data.length !== 0) {
                    console.log("Getting keywords 1 to 4");
                    resJson.keyword1 = data[0].keyword1;
                    resJson.keyword2 = data[0].keyword2;
                    resJson.keyword3 = data[0].keyword3;
                    resJson.keyword4 = data[0].keyword4;
                  }

                  // Handle highlighted keyword
                  console.log("Printing highlightedKeyword");
                  console.log(highlightedKeyword);
                  connection.query(`
                    SELECT
                      business_id,
                      user_id,
                      date,
                      compliment_count,
                      text
                    FROM tip
                    WHERE tip.business_id = '${businessId}'
                      AND text LIKE '%${highlightedKeyword}%'
                    LIMIT 2;
                  `, (err, data) => {
                    if (err) {
                      console.log(err);
                      res.status(404).json({});
                    } else {
                      if (data.length === 0) {
                        console.log("No matching highlighted keyword found");
                      } else {
                        console.log("Matching highlighted keyword found");
                        if (highlightedKeyword !== '') {
                          if (data.length >= 1) {
                            resJson.date1 = data[0].date;
                            resJson.text1 = data[0].text;
                          }
                          if (data.length >= 2) {
                            resJson.date2 = data[1].date;
                            resJson.text2 = data[1].text;
                          }
                        }
                      }

                      // handle daily check in
                      console.log("Begin handling daily check in");
                      connection.query(`
                        SELECT *
                        FROM yelp.temp_checkin_by_dow
                        WHERE business_id = '${businessId}';
                      `, (err, data) => {
                        if (err || data.length === 0) {
                          console.log(err);
                          res.status(404).json({});
                        } else {
                          console.log("Adding daily check-in info to resJson");
                          resJson.total_checkin_0 = data[0].total_checkin;
                          resJson.total_checkin_1 = data[1].total_checkin;
                          resJson.total_checkin_2 = data[2].total_checkin;
                          resJson.total_checkin_3 = data[3].total_checkin;
                          resJson.total_checkin_4 = data[4].total_checkin;
                          resJson.total_checkin_5 = data[5].total_checkin;
                          resJson.total_checkin_6 = data[6].total_checkin;
                          res.status(200).json(resJson);
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
}

// Route: POST "/loginUser"
const loginUser = async function (req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    console.log("Missing username or password");
    res.status(400).json({});
    return;
  }

  connection.query(`
  SELECT user_id FROM user_credentials WHERE user_name = '${username}' AND user_password = '${password}';
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log("Incorrect username or password");
      res.status(404).json({});
    } else {
      res.status(200).json({ userId: data[0].user_id });
    }
  });
}

// Route: POST "/registerUser"
const registerUser = async function (req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    console.log("Missing username or password");
    res.status(400).json({});
    return;
  }

  // Check to see if username is already taken
  connection.query(`
    SELECT user_id FROM user_credentials WHERE user_name = '${username}';
  `, (_err, data) => {
    if (data.length !== 0) {
      console.log("Username already taken");
      res.status(409).json({});
      return;
    }

    // Only proceed with this insertion if the username is not taken
    connection.query(`
      INSERT INTO user_credentials (user_name, user_password) VALUES ('${username}', '${password}');
    `, (err, _data) => {
      if (err) {
        console.log(err);
        res.status(500).json({});
      } else {
        res.status(201).json({});
      }
    });
  });
}

// Route: GET "/getTops"
const getTops = async function (req, res) {
  const page = req.query.page;
  const pageSize = req.query.page_size;

  connection.query(`
    DROP VIEW IF EXISTS normalized_business_checkins;
    CREATE VIEW normalized_business_checkins AS
    SELECT
      c.business_id,
      (c.visits_reviews -
      (SELECT MIN(visits_reviews) FROM checks ck) ) /
      ((SELECT MAX(visits_reviews) FROM checks ck)  - (SELECT MIN(visits_reviews) FROM checks ck)) AS normalized_visits_reviews
    FROM
      checks c
    ORDER BY normalized_visits_reviews DESC LIMIT 120;

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
    ORDER BY ind DESC, quality_rank DESC, ambiance_rank DESC, service_rank DESC
    LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log("Error in getTops: ", err);
      res.status(404).json({});
    } else {
      console.log("Success in getTops: ", data[2]);
      res.status(200).json({ businesses: data[2] });
    }
  })
}

module.exports = {
  businessSearch,
  businessRec,
  businessById,
  loginUser,
  registerUser,
  getTops
}