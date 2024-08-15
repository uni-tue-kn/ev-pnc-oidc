FROM ubuntu:latest

RUN apt update && apt upgrade -y

RUN apt install -y curl openssl ca-certificates

WORKDIR /app
COPY ./entrypoint.sh /app/entrypoint.sh
COPY ./csr.sh /app/csr.sh
COPY ./csr.conf /app/csr.conf

RUN mkdir /app/output

ENV n=20
ENV t=60
ENV at=""

ENTRYPOINT [ "/app/entrypoint.sh" ]
