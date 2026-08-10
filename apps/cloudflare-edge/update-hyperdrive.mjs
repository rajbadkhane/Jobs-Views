import { execSync } from "child_process";

const url = "postgresql://postgres.dnqomorishchdrfjfvlt:KingR%4012345%40%23@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require";
const cmd = `npx wrangler hyperdrive update 61143b5e6a1c460d89b2d47ac7309609 --connection-string="${url}"`;

try {
  console.log("Running:", cmd);
  const output = execSync(cmd, { stdio: "inherit" });
  console.log("Hyperdrive updated successfully!");
} catch (error) {
  console.error("Failed to update Hyperdrive:", error.message);
  process.exit(1);
}
