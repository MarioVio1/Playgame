#!/bin/bash
while true; do
    echo "Starting WebSocket server..."
    bun index.ts
    echo "Server crashed, restarting in 2s..."
    sleep 2
done
