FROM golang:1.21 AS build
WORKDIR /go/src
COPY go ./go
COPY main.go .

ENV CGO_ENABLED=0
RUN go get -d -v ./...

RUN go build -a -installsuffix cgo -o server .

FROM scratch AS runtime
COPY --from=build /go/src/server ./
COPY ./openid-configuration.json ./openid-configuration.json
EXPOSE 8080/tcp
ENTRYPOINT ["./server"]
