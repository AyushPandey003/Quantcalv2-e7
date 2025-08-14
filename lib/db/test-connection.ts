import { db } from './db';

export async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    
    // Try a simple query to test connection
    const result = await db.execute('SELECT 1 as test');
    console.log('✅ Database connection successful:', result);
    
    return { success: true, message: 'Database connection successful' };
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('password authentication failed')) {
        return { 
          success: false, 
          message: 'Password authentication failed. Please check your database credentials in .env file.',
          error: error.message 
        };
      } else if (error.message.includes('connection')) {
        return { 
          success: false, 
          message: 'Connection failed. Please check your DATABASE_URL and ensure the database is accessible.',
          error: error.message 
        };
      } else if (error.message.includes('DATABASE_URL')) {
        return { 
          success: false, 
          message: 'DATABASE_URL environment variable is not set or invalid.',
          error: error.message 
        };
      }
    }
    
    return { 
      success: false, 
      message: 'Unknown database connection error.',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function checkDatabaseTables() {
  try {
    console.log('Checking database tables...');
    
    // Try to query the users table to see if it exists
    const result = await db.execute('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\'');
    console.log('✅ Database tables check successful:', result);
    
    return { success: true, tables: result, message: 'Database tables check successful' };
  } catch (error) {
    console.error('❌ Database tables check failed:', error);
    return { 
      success: false, 
      message: 'Failed to check database tables.',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 