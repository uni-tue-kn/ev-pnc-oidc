package main

import (
	"log"
	"net/http"
	"os"

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

	emsp_backend.LogWriter, err = os.OpenFile("/logs/log.csv", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0666)
	if err != nil {
		log.Printf("Failed to create log file writer")
		return
	}
	defer emsp_backend.LogWriter.Close()

	// Initialize Router
	router := emsp_backend.NewRouter()

	log.Printf("Server started")

	// Start HTTP Server
	log.Fatal(http.ListenAndServe(":"+emsp_backend.Configuration.Port, router))
}
