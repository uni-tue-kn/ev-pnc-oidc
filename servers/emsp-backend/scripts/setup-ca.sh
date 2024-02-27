#!/bin/sh

# Creates a "ca" directory and generates a Certificate Authority inside.

# Create "ca" directory if not exists
mkdir -p ./ca

# Generate the Key Pair of the Certificate Authority, if not exists
if [ ! -f "./ca/ca.key" ]; then
    # Generate an elliptic curve key pair for ES256
    openssl ecparam -name prime256v1 -genkey -noout -out ./ca/ca.key
fi

# Generate a self-signed X.509 Certificate Authority Root Certificate valid for 2 years, if not exists
if [ ! -f "./ca/ca.pem" ]; then
    openssl req -x509 -sha256 -new -nodes -key ./ca/ca.key -config ./config/ca.conf -days 730 -out ./ca/ca.pem
fi

# Generate Serial Number file, if not exists
if [ ! -f "./ca/ca.srl" ]; then
    echo "00" > ./ca/ca.srl
fi
