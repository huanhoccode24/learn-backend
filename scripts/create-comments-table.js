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
            CREATE TABLE IF NOT EXISTS comments (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                "postId" UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
                "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                "parentId" UUID REFERENCES comments(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_comments_post ON comments("postId");
            CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments("parentId");
        `;
        
        await client.query(query);
        console.log('Migration successful: Created comments table and indexes.');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigration();
