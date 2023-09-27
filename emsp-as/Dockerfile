FROM golang:1.21 AS build
WORKDIR /go/src
COPY . .

ENV CGO_ENABLED=0
RUN go get -d -v ./...
RUN apt-get install -y ca-certificates

RUN make

FROM scratch AS runtime
COPY --from=build /go/src/gin-oauth-server ./
COPY --from=build /go/src/css ./css
COPY --from=build /go/src/templates ./templates
COPY --from=build /etc/ssl /etc/ssl
COPY ./authlete.toml ./authlete.toml

ENV PORT=8080
EXPOSE ${PORT}/tcp
ENTRYPOINT ["./gin-oauth-server"]
