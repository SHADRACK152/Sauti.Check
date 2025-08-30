// This script creates a default admin user if one does not exist.
import { drizzle } from 'drizzle-orm';
import { createClient } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL || '';
const client = createClient({ connectionString });
const db = drizzle(client);

const adminUser = {
  username: 'admin',
  email: 'admin@sauticheck.com',
  firstName: 'Admin',
  lastName: 'User',
  location: 'HQ',
  password: bcrypt.hashSync('admin123', 10),
  role: 'admin',
};

async function createDefaultAdmin() {
  // Check if admin exists
  const existing = await db.query.users.findFirst({
    where: { email: adminUser.email },
  });
  if (existing) {
    console.log('Admin user already exists.');
    return;
  }
  // Insert admin
  await db.insertInto('users').values(adminUser).execute();
  console.log('Default admin created:', adminUser.email);
}

createDefaultAdmin().then(() => process.exit(0));
