import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://postgres:Huanthe113!@localhost:5432/mydb"
});

async function createNotificationsTable() {
  try {
    console.log('Creating notifications table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        "postId" UUID,
        "isRead" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications("userId");
      CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications("isRead");
    `);
    console.log('Successfully created notifications table.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

createNotificationsTable();
