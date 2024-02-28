#!/bin/sh

# Generate Key Pair and Certificate Signing Request
openssl req -new -newkey rsa:4096 -nodes -sha256 -config /app/csr.conf -keyout /app/output/ev.key -out /app/output/request.csr
