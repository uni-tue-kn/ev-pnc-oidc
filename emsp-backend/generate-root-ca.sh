#!/bin/bash

# Generate the Key Pair of the Root Certificate Authority
openssl genrsa -out root-ca.key 4096

# Generate a self-signed X.509 Root Certificate Authority Certificate, valid for 2 years.
openssl req -x509 -sha256 -new -nodes -key root-ca.key -config csr.conf -days 730 -out root-ca.der

# Generate Serial Number file
echo "00" > ./root-ca.srl
