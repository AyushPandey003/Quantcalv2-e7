-- Reset database script
-- WARNING: This will delete ALL data

-- Drop all tables in the correct order (to handle foreign key constraints)
DROP TABLE IF EXISTS watchlist_symbols CASCADE;
DROP TABLE IF EXISTS watchlist_items CASCADE;
DROP TABLE IF EXISTS price_alerts CASCADE;
DROP TABLE IF EXISTS market_data CASCADE;
DROP TABLE IF EXISTS user_watchlists CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS symbols CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS plan CASCADE;
DROP TYPE IF EXISTS theme CASCADE;

-- Drop any other conflicting objects
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS verification_tokens CASCADE;

-- Now you can run: pnpm db:push
