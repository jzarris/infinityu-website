#!/bin/sh
# Apply any pending schema changes to the database
npx prisma db push --skip-generate 2>&1 || echo "Warning: prisma db push failed"

# Start the application
exec node server.js
