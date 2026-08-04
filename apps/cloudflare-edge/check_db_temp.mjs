import postgres from 'postgres';
const url = 'postgresql://postgres.mhsboihpuenoxzbmazry:KingR%4012345%40%23@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require';

const sql = postgres(url, {
  ssl: 'require',
  max: 1,
  fetch_types: false,
  prepare: false
});

async function run() {
  try {
    console.log('Connecting to Supabase...');
    const res = await sql`SELECT 1 as val`;
    console.log('✅ DB Connection Success:', res);
  } catch (e) {
    console.error('❌ DB Connection Error:', e);
  } finally {
    await sql.end();
  }
}

run();
