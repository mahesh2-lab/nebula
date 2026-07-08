const postgres = require('postgres');
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nebula';
const sql = postgres(connectionString);

async function main() {
  try {
    const rows = await sql`SELECT id, status, "commit_message", "created_at" FROM deployments ORDER BY "created_at" DESC LIMIT 5`;
    console.log("Database rows:", rows);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}
main();
