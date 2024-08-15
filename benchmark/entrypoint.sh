#!/bin/bash

echo ";n=$n;t=$t"

echo "i,n"

# For loop from i=1 to i=n
for i in $(seq 1 $n);
do
  # While loop which repeats for $t seconds
  SECONDS=0
  SUCCESSES=0
  while [ $SECONDS -lt $t ]
  do
    # Generate key pair (ev.key) and CSR (request.csr)
    /bin/bash /app/csr.sh
    # Send CSR to server
    curl -s --location 'https://emsp.oidcharge.primbs.dev/csr' --header 'Content-Type: application/pkcs10' --header "Authorization: Bearer ${at}" --data "$(cat /app/output/request.csr)" > /dev/null
    # Successes ++
    ((SUCCESSES++))
  done

  echo "$i,$SUCCESSES"
done

echo 'done'
