#!/bin/bash

# Generate Key Pair and Certificate Signing Request
openssl req -new -newkey rsa:4096 -nodes -sha256 -config csr.conf -keyout ev.key -out ev.csr
