# 🗄️ Database Schema

The Real Estate CRM uses a relational SQLite database structure.

## Tables

### 1. `properties`
Stores basic property data and market valuations.
- `property_id` (PK): Unique identifier
- `property_type`: House, Land, Condo, etc.
- `sell_price`: Current asking price
- `avg_market_price`: Automated market valuation
- `address`: Full location details
- `status`: 'sold' or 'unsold'
- `created_at`: Original listing date

### 2. `contacts`
Stores seller information.
- `contact_id` (PK)
- `contact_name`
- `phone`
- `email`

### 3. `leads`
The core CRM engine table linking properties to sales actions.
- `lead_id` (PK)
- `property_id` (FK)
- `lead_score`: AI calculated score (0-100)
- `lead_priority`: 'critical', 'high', 'medium', 'low'
- `pain_score`: Score based on days-on-market
