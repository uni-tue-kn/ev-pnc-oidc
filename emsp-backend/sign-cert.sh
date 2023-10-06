#!/bin/bash

openssl x509 -req -sha256 -days 90 -in ev.csr -CA root-ca.der -CAkey root-ca.key -out ev.crt
