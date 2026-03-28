#!/bin/bash
# Start WebSocket server and keep it alive

cd /home/z/my-project/mini-services/game-ws

while true; do
    echo "Starting WebSocket server..."
    bun index.ts
    echo "Server crashed, restarting in 2 seconds..."
    sleep 2
done
