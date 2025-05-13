#!/bin/bash
# wait-for-db.sh

set -e

host="$1"
shift

until PGPASSWORD=$DATABASE_PASSWORD psql -h "$host" -U "$DATABASE_USER" -d "$DATABASE_NAME" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - continuing"
exec "$@"