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
    const { db } = await import('../lib/db');
    const { users, projects, deployments, envVariables, domains, apiKeys } = await import('../lib/db/schema');

    console.log('Clearing all tables in the database...');
    
    // Delete in order to avoid foreign key violations
    console.log('- Clearing apiKeys...');
    await db.delete(apiKeys);
    
    console.log('- Clearing domains...');
    await db.delete(domains);
    
    console.log('- Clearing envVariables...');
    await db.delete(envVariables);
    
    console.log('- Clearing deployments...');
    await db.delete(deployments);
    
    console.log('- Clearing projects...');
    await db.delete(projects);
    
    console.log('- Clearing users...');
    await db.delete(users);

    console.log('Database cleared successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error during database clearing:', err);
    process.exit(1);
  }
}

main();
