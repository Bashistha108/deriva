#!/bin/bash

# start.sh - Deriva Startup Script

CONFIG_FILE=".db_env"

# Load saved defaults if available
if [ -f "$CONFIG_FILE" ]; then
  source "$CONFIG_FILE"
fi

DEFAULT_DB_HOST=${SAVED_DB_HOST:-localhost}
DEFAULT_DB_PORT=${SAVED_DB_PORT:-5433}
DEFAULT_DB_NAME=${SAVED_DB_NAME:-deriva}
DEFAULT_DB_USER=${SAVED_DB_USER:-deriva}

# Prompt for Database Credentials
while true; do
  read -p "Enter Database Host [$DEFAULT_DB_HOST]: " DB_HOST
  DB_HOST=${DB_HOST:-$DEFAULT_DB_HOST}

  read -p "Enter Database Port [$DEFAULT_DB_PORT]: " DB_PORT
  DB_PORT=${DB_PORT:-$DEFAULT_DB_PORT}

  read -p "Enter Database Name [$DEFAULT_DB_NAME]: " DB_NAME
  DB_NAME=${DB_NAME:-$DEFAULT_DB_NAME}

  read -p "Enter Database Username [$DEFAULT_DB_USER]: " DB_USER
  DB_USER=${DB_USER:-$DEFAULT_DB_USER}

  read -sp "Enter Database Password [password]: " DB_PASS
  DB_PASS=${DB_PASS:-password}
  echo ""

  echo "Testing database connection..."
  if PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c '\q' 2>/dev/null; then
    echo "Database connection successful!"
    
    # Save the successful credentials (except password)
    echo "SAVED_DB_HOST=\"$DB_HOST\"" > "$CONFIG_FILE"
    echo "SAVED_DB_PORT=\"$DB_PORT\"" >> "$CONFIG_FILE"
    echo "SAVED_DB_NAME=\"$DB_NAME\"" >> "$CONFIG_FILE"
    echo "SAVED_DB_USER=\"$DB_USER\"" >> "$CONFIG_FILE"
    
    break
  else
    echo "Error: Could not connect to the database with the provided credentials. Please try again."
    echo ""
  fi
done

# Log file setup
LOG_FILE="app.log"
> "$LOG_FILE" # Overwrite log file on startup

echo "Verifying required services..."

YML_FILE="deriva-application/src/main/resources/application.yml"

# Extract Redis and Kafka ports dynamically from the YAML file
REDIS_PORT=$(grep -A 2 "redis:" "$YML_FILE" | grep "port:" | awk '{print $2}')
KAFKA_PORT=$(grep "bootstrap-servers:" "$YML_FILE" | awk -F':' '{print $NF}' | tr -d ' ' | tr -d '"' | tr -d "'")

# Fallbacks in case extraction fails
REDIS_PORT=${REDIS_PORT:-6379}
KAFKA_PORT=${KAFKA_PORT:-9092}

# Check Redis
if ! nc -z localhost $REDIS_PORT; then
  echo "Error: Expected Redis to be running on port $REDIS_PORT (from $YML_FILE), but it is not available. Please check your local installation and try again."
  exit 1
fi

# Check Kafka
if ! nc -z localhost $KAFKA_PORT; then
  echo "Error: Expected Kafka to be running on port $KAFKA_PORT (from $YML_FILE), but it is not available. Please check your local installation and try again."
  exit 1
fi

echo "All required services (Postgres, Redis, Kafka) are running on their expected ports."

echo "Starting Deriva Application..."
echo "Logs will be written to $LOG_FILE. Press Ctrl+C to stop."

# Start Backend
export SPRING_DATASOURCE_URL="jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}"
export SPRING_DATASOURCE_USERNAME="${DB_USER}"
export SPRING_DATASOURCE_PASSWORD="${DB_PASS}"

echo "[System] Starting Backend..." >> "$LOG_FILE"
mvn -pl deriva-bootstrap spring-boot:run >> "$LOG_FILE" 2>&1 &
BACKEND_PID=$!

# Start Frontend
echo "[System] Starting Frontend..." >> "$LOG_FILE"
cd deriva-frontend
npm run dev >> "../$LOG_FILE" 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for Ctrl+C to terminate both processes
trap "echo 'Stopping processes...'; kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM

# Tail the logs to the console
tail -f "$LOG_FILE"
