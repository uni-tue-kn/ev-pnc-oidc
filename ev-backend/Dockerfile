FROM golang:1.21 AS build
WORKDIR /go/src
COPY go ./go
COPY main.go .
COPY go.mod .

ENV CGO_ENABLED=0
RUN go get -d -v ./...

RUN go build -a -installsuffix cgo -o server .

FROM debian:stable AS runtime
RUN apt-get update && apt-get upgrade -y && apt-get install -y openssl ca-certificates
RUN  update-ca-certificates

WORKDIR /app
COPY --from=build /go/src/server ./server
COPY ./config ./config
COPY ./scripts ./scripts
RUN mkdir ./output

ENV PORT=8080
ENV CSR_ENDPOINT=http://emsp.localhost
ENV OUTPUT_FILE=./output/cc.cer

EXPOSE ${PORT}/tcp
ENTRYPOINT ["./server"]
