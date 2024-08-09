package main

import (
	"log"
	"net/http"

	emsp_backend "emsp_backend/go"
)

func main() {
	log.Printf("Starting server...")

	// Load Configuration
	err := emsp_backend.LoadConfiguration()
	if err != nil {
		log.Fatalf("Loading failed: " + err.Error())
		return
	}

	// Initialize Router
	router := emsp_backend.NewRouter()

	log.Printf("Server started")

	// Start HTTP Server
	log.Fatal(http.ListenAndServe(":"+emsp_backend.Configuration.Port, router))
}
