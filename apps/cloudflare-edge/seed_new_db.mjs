import postgres from "postgres";
import fs from "fs";
import path from "path";

const sql = postgres(
  "postgresql://postgres.dnqomorishchdrfjfvlt:KingR%4012345%40%23@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres",
  { ssl: "require", max: 1 }
);

async function run() {
  const dir = path.join(process.cwd(), "..", "api", "seeds");
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".sql") && !f.includes("rollback")).sort();
  
  for (const file of files) {
    console.log(`Running seed: ${file}...`);
    const content = fs.readFileSync(path.join(dir, file), "utf8");
    try {
      await sql.unsafe(content);
      console.log(`✅ ${file} seeded successfully.`);
    } catch (err) {
      console.error(`❌ Error in ${file}:`, err.message);
    }
  }
  console.log("Database seeding complete!");
  process.exit(0);
}

run();
