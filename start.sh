#!/bin/bash

# Trap Ctrl+C (SIGINT) to gracefully shut down both backend and frontend
trap 'echo -e "\n🛑 Stopping Deriva services..."; kill 0; exit 0' SIGINT

# Load defaults if they exist
ENV_FILE=".deriva_env"
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
fi

echo "=========================================="
echo " Deriva Local Development Starter "
echo "=========================================="
echo "Please enter your PostgreSQL database details:"

while true; do
    echo -n "Database Host [default: ${SAVED_DB_HOST:-localhost}]: "
    read DB_HOST
    DB_HOST=${DB_HOST:-${SAVED_DB_HOST:-localhost}}

    echo -n "Database Port [default: ${SAVED_DB_PORT:-5432}]: "
    read DB_PORT
    DB_PORT=${DB_PORT:-${SAVED_DB_PORT:-5432}}

    echo -n "Database Name [default: ${SAVED_DB_NAME:-deriva}]: "
    read DB_NAME
    DB_NAME=${DB_NAME:-${SAVED_DB_NAME:-deriva}}

    echo -n "Username [default: ${SAVED_DB_USER:-deriva}]: "
    read DB_USER
    DB_USER=${DB_USER:-${SAVED_DB_USER:-deriva}}

    if [ -n "$SAVED_DB_PASSWORD" ]; then
        DB_PASSWORD="$SAVED_DB_PASSWORD"
    else
        echo -n "Password: "
        read -s DB_PASSWORD
        echo
    fi

    echo -e "\n⏳ Testing connection to $DB_HOST:$DB_PORT..."
    
    # Use local psql to test the credentials
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c '\q' > /dev/null 2>&1; then
        echo -e "✅ Connection successful!\n"
        # Save credentials for next time (excluding password)
        echo "SAVED_DB_HOST=\"$DB_HOST\"" > "$ENV_FILE"
        echo "SAVED_DB_PORT=\"$DB_PORT\"" >> "$ENV_FILE"
        echo "SAVED_DB_NAME=\"$DB_NAME\"" >> "$ENV_FILE"
        echo "SAVED_DB_USER=\"$DB_USER\"" >> "$ENV_FILE"
        break
    else
        echo -e "❌ Connection failed! Please check your credentials and make sure PostgreSQL is running.\n"
    fi
done

# Export credentials as environment variables so Spring Boot automatically picks them up
export SPRING_DATASOURCE_URL="jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}"
export SPRING_DATASOURCE_USERNAME="${DB_USER}"
export SPRING_DATASOURCE_PASSWORD="${DB_PASSWORD}"

echo "=========================================="
echo "🛠️  Starting up services..."
echo "=========================================="

# Start Backend
echo "Starting Spring Boot Backend..."
(cd backend && mvn clean install -DskipTests && cd deriva-bootstrap && mvn spring-boot:run) &

# Give backend a 3 second head start
sleep 3

# Start Frontend
echo "Starting Next.js Frontend..."
(cd frontend && npm run dev) &

echo -e "\n=========================================="
echo "🎉 Deriva is running locally!"
echo "Backend:  http://localhost:8080"
echo "Frontend: http://localhost:3000"
echo "Press Ctrl+C at any time to stop both servers."
echo "==========================================\n"

# Keep the script running and wait for background processes to finish (or Ctrl+C)
wait
