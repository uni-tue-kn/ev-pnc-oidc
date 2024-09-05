#!/bin/sh

# Generate Key Pair
openssl ecparam -name secp521r1 -genkey -noout -out /app/output/ev.key
# Generate Certificate Signing Request
openssl req -new -sha256 -config /app/csr.conf -key /app/output/ev.key -out /app/output/request.csr
