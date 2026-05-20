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
        
        const query = `
            CREATE TABLE IF NOT EXISTS post_collaborators (
                post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (post_id, user_id)
            );
        `;
        
        await client.query(query);
        console.log('Migration successful: Created post_collaborators table.');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigration();
