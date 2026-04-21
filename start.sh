#!/bin/sh
# Apply any pending schema changes using a direct SQL approach
# This avoids needing the full Prisma CLI and its dependencies in the runner
node -e "
const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();
prisma.\$executeRawUnsafe(\`
  CREATE TABLE IF NOT EXISTS \"Setting\" (
    \"key\" TEXT PRIMARY KEY,
    \"value\" TEXT NOT NULL,
    \"updatedAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
\`).then(() => {
  console.log('Database schema verified');
  prisma.\$disconnect();
}).catch(e => {
  console.error('Schema check failed:', e.message);
  prisma.\$disconnect();
});
"

# Start the application
exec node server.js
