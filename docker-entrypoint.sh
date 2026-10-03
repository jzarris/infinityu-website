#!/bin/sh
# Fix volume mount ownership then drop to nextjs user
mkdir -p /app/data
chown -R nextjs:nodejs /app/data
exec su-exec nextjs ./start.sh
