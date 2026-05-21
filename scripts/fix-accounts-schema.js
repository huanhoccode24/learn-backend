const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function fixSchema() {
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
        
        // Drop bảng cũ
        console.log('Dropping old accounts and sessions tables...');
        await client.query('DROP TABLE IF EXISTS accounts CASCADE;');
        await client.query('DROP TABLE IF EXISTS sessions CASCADE;');

        // Tạo lại bảng accounts với id là VARCHAR(255)
        console.log('Recreating accounts table with VARCHAR id...');
        await client.query(`
            CREATE TABLE accounts (
              id VARCHAR(255) PRIMARY KEY,
              "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              type VARCHAR(255) NOT NULL,
              provider VARCHAR(255) NOT NULL,
              "providerAccountId" VARCHAR(255) NOT NULL,
              refresh_token TEXT,
              access_token TEXT,
              expires_at BIGINT,
              id_token TEXT,
              scope TEXT,
              session_state TEXT,
              token_type TEXT
            );
        `);

        // Tạo lại bảng sessions với id là VARCHAR(255)
        console.log('Recreating sessions table with VARCHAR id...');
        await client.query(`
            CREATE TABLE sessions (
              id VARCHAR(255) PRIMARY KEY,
              "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              expires TIMESTAMPTZ NOT NULL,
              "sessionToken" VARCHAR(255) NOT NULL UNIQUE
            );
        `);

        console.log('Migration successful: Recreated accounts and sessions tables with VARCHAR(255) id.');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

fixSchema();
