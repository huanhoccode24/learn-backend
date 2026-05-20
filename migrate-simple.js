/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const dbUrlMatch = envContent.match(/DATABASE_URL=["']?(.+?)["']?\s*$/m);
    
    if (!dbUrlMatch) {
        console.error('DATABASE_URL not found in .env');
        process.exit(1);
    }
    
    const connectionString = dbUrlMatch[1];
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('Connected to DB');
        await client.query('ALTER TABLE categories ADD COLUMN IF NOT EXISTS "isHidden" BOOLEAN DEFAULT FALSE');
        console.log('Migration successful: Added isHidden column to categories.');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigration();
