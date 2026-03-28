#!/bin/bash
# Watchdog script for WebSocket server

while true; do
    echo "Starting WebSocket server..."
    bun index.ts
    echo "Server died, restarting in 2 seconds..."
    sleep 2
done
