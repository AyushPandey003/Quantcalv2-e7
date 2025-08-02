
import postgres from "postgres"

const resetScript = `
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
`

async function resetDatabase() {
  // Use the same DATABASE_URL from your .env file
  const DATABASE_URL = "postgresql://neondb_owner:npg_5Gb0aoLWQCcF@ep-twilight-darkness-a1tth0ik-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
  
  if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set")
    process.exit(1)
  }

  console.log("🔗 Connecting to Neon database...")
  console.log(`📍 Database: ${DATABASE_URL.split('@')[1]?.split('?')[0] || 'unknown'}`)
  
  const client = postgres(DATABASE_URL, { max: 1 })
  
  try {
    console.log("🗑️  Resetting database...")
    await client.unsafe(resetScript)
    console.log("✅ Database reset complete!")
    console.log("📝 Run 'pnpm db:push' to create the new schema")
  } catch (error) {
    console.error("❌ Error resetting database:", error)
  } finally {
    await client.end()
  }
}

resetDatabase()
