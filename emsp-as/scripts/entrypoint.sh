#!/bin/sh

# Main Entrypoint for Dockerfile

# Generate Authorization Server's Key Pair if not exists
./scripts/generate-cert.sh

# Start HTTP Server
./server
