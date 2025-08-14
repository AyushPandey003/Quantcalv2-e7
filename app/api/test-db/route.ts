import { NextResponse } from 'next/server';
import { db } from '@/lib/db/db';

export async function GET() {
  try {
    // Test basic connection
    const connectionTest = await db.execute('SELECT 1 as test');
    console.log('Connection test result:', connectionTest);

    // Test if users table exists
    const tableTest = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);
    console.log('Table test result:', tableTest);

    // Test if we can query the users table
    const userCount = await db.execute('SELECT COUNT(*) as count FROM users');
    console.log('User count result:', userCount);

    return NextResponse.json({
      success: true,
      message: 'Database tests completed',
      results: {
        connection: connectionTest,
        tableExists: tableTest.length > 0,
        userCount: userCount[0]?.count || 0
      }
    });
  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Database test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
