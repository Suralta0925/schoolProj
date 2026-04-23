#!/bin/bash

PORT_FRONT=5173
PORT_BACK=8000

echo "🔓 Opening ports..."

sudo ufw allow $PORT_FRONT

# Cleanup function
cleanup() {
    echo ""
    echo "🧹 Cleaning up..."

    sudo ufw delete allow $PORT_FRONT

    echo "🔒 Ports closed. Bye."
    exit
}

# Trap Ctrl+C (SIGINT) and script termination
trap cleanup SIGINT SIGTERM

echo "🚀 Starting backend..."
(
cd ~/SchedulerProject/simple_backend || exit
./run.sh
) &
BACK_PID=$!

echo "🎨 Starting frontend..."
(
cd ~/SchedulerProject/frontend/SchedulerSys
./run.sh
) &
FRONT_PID=$!

# Wait for processes
wait $BACK_PID $FRONT_PID

cleanup
