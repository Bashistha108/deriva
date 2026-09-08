#!/bin/bash

# start.sh - Deriva Startup Script

# Prompt for Database Credentials
read -p "Enter Database Host [localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Enter Database Port [5432]: " DB_PORT
DB_PORT=${DB_PORT:-5432}

read -p "Enter Database Name [deriva]: " DB_NAME
DB_NAME=${DB_NAME:-deriva}

read -p "Enter Database Username [postgres]: " DB_USER
DB_USER=${DB_USER:-postgres}

read -sp "Enter Database Password [password]: " DB_PASS
DB_PASS=${DB_PASS:-password}
echo ""

# Log file setup
LOG_FILE="app.log"
> "$LOG_FILE" # Overwrite log file on startup

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
