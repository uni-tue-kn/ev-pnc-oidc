#!/bin/sh

# Signs a CSR File
#
# Required Parameters:
# - $1 = CSR file
# - $2 = CRT File
#
# Requires a root certificate in ./ca/root.der and a Private Key file in ./ca/root.key
#
# Example:
#   $ ./sign-cert.sh ./csr/server.csr ./crt/server.crt

# Creates an X.509 certificate from the CSR file valid for 90 days
openssl x509 -req -sha256 -days 90 -in $1 -extfile ./config/csr.conf -CA ./ca/ca.pem -CAkey ./ca/ca.key -CAserial ./ca/ca.srl -out $2
