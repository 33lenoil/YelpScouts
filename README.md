## 🚀 Overview
**yelpscout** helps users find businesses, refine results with rich filters, inspect individual business pages (popularity by weekday, ratings, reservation availability, review-tip keywords), see a **Top 100** global ranking, and receive **personalized recommendations** based on recent searches. It includes **sign-up / log-in** and session-based access.

---

## 🧰 Tech Stack (as implemented)
- **Frontend UI:** React.js + CSS  
- **Backend Server:** Node.js (Express.js)  
- **Database:** MySQL (RDS) — DDL/DML, indexes, joins, unions, aggregations, views, subqueries  
- **NLP (preprocessing phase):** Python with **RAKE-NLTK** for keyword extraction from *tip* texts (up to four per review)  
- **Infra:** Google Cloud VM for large-scale preprocessing/model runs  
- **Client ↔ API:** Axios for streaming user search/browse data into the backend (supports real-time personalization)

---

## ✨ Features

### Authentication
- **Sign-up** and **Log-in** pages  
- Pages are accessible only when logged in (sessionStorage used for gating)

### Advanced Search (Home)
- Text inputs, dropdowns, sliders for refined search  
- Filters implemented: **name, address, city, state, postal code, rating, category**  
- Displays results and **personalized recommendations** on the homepage

### Single Business Page
- **Popularity by day of week**, current **rating**, **reservation availability** flag  
- **Business vs. industry averages** (visits, average review stars, total reviews)  
- **Keyword chips** extracted from *tip* texts; click a keyword to view related tips & timestamps

### Global Ranking Page
- **Top 100**: combines a normalized “stars vs. visits” index with **keyword-based** (quality/ambiance/service) signals

---

## 📦 Data Sources & Preprocessing
- **Yelp Open Dataset** (business, review, checkin, tip, etc.)  
- **Preprocessing highlights**
  - Convert large **JSON** datasets to **CSV** for ingestion; clean malformed JSON
  - Use **JSON_TABLE** / **JSON_VALUE** to parse/document JSON fields into relational columns
  - Normalize into multiple tables: `business`, `category`, `hour`, `checkin`, `reviews`, `tip`, plus derived `keywords_tip` (from RAKE-NLTK)  
  - Maintain integrity via **PRIMARY KEY** on `business.business_id` and **FOREIGN KEY** references elsewhere

**Example scale (rows)**
- `business`: **150,346** • `category`: **150,346** • `hour`: **127,123**  
- `checkin`: **12,103,993** • `reviews` (subsample): **200,000** • `tip`: **219,984**  
- `keywords_tip`: **61,000** • `user_credentials`: demo rows • `user_searchs`: streaming log (demo)

---
