#!/bin/sh

# Main Entrypoint for Dockerfile

# Initialize Certificate Authority by creating a new CA key if not exists
./scripts/setup-ca.sh

# Start HTTP Server
./server
