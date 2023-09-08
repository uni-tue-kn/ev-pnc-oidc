package main

import (
	"log"
	"net/http"

	discovery "discovery/go"
)

func main() {
	log.Printf("Server started")

	router := discovery.NewRouter()

	log.Fatal(http.ListenAndServe(":8080", router))
}
