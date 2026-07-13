#!/bin/bash

cleanup() {
    echo ""
    echo "Stopping Spring Boot and Angular servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    echo "Both servers stopped cleanly."
    exit 0
}

# detects the ctrl C to start the cleanup function
trap cleanup SIGINT

echo "Pulling latest code from GitHub..."
cd ~/boycott-list || exit
git pull origin main

# ==========================================
# BUILD STEPS
# ==========================================

echo "Building Spring Boot backend..."
cd ~/boycott-list/backend || exit
mvn clean package -DskipTests

echo "Building Angular frontend..."
cd ~/boycott-list/frontend || exit
npm run build

echo "Committing and pushing frontend dist folder to GitHub..."
# Force add the dist folder
git add dist/ -f
# Commit the files (will just bypass if there are no changes)
git commit -m "Force adding production dist folder"
# Push to GitHub
git push

# ==========================================
# SERVER STARTUP
# ==========================================

echo "Starting Spring Boot backend (Production Mode)..."
cd ~/boycott-list/backend || exit

# FIXED: The -D flag is now BEFORE the -jar flag!
java -Djava.security.egd=file:/dev/./urandom -jar target/backend-0.0.1-SNAPSHOT.jar &
BACKEND_PID=$!

# Give Java 5 seconds to boot up
sleep 5

echo "Starting Angular frontend..."
cd ~/boycott-list/frontend || exit
HOST=0.0.0.0 PORT=4200 node dist/frontend/server/server.mjs &
FRONTEND_PID=$!
echo "FRONTEND LAUNCHED -- now go to https://boycott-list.abdoudiallo.fr/"

wait