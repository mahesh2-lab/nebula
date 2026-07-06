import fs from 'fs';
import path from 'path';

// Load .env file variables manually for script environments
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const index = trimmed.indexOf('=');
      if (index > 0) {
        const key = trimmed.substring(0, index).trim();
        const val = trimmed.substring(index + 1).trim().replace(/^["']|["']$/g, '');
        if (key && !process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
} catch (_) {}

async function main() {
  try {
    const { seedDatabase } = await import('../lib/db/seed');
    await seedDatabase();
    process.exit(0);
  } catch (err) {
    console.error('Error during database initialization:', err);
    process.exit(1);
  }
}

main();
