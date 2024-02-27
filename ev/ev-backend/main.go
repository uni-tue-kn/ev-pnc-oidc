/*
 * EV Backend
 *
 * API version: 0.0.1
 * Generated by: Swagger Codegen (https://github.com/swagger-api/swagger-codegen.git)
 */
package main

import (
	"log"
	"net/http"
	"os"

	ev_backend "ev_backend/go"
)

func main() {
	log.Printf("Loading eMSPs ...")
	var err error
	err = ev_backend.LoadEmspResourceEps("./config/emsp_resource_ep.json")
	err = ev_backend.LoadClientCredentials("./config/emsp_creds.json")
	ev_backend.Emsps, err = ev_backend.ReadEmsps("./config/emsp.json")
	if err != nil {
		panic("Failed to load eMSPs from ./config/emsp.json")
	}

	log.Printf("Server started")

	router := ev_backend.NewRouter()

	// Get port from environment.
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Fatal(http.ListenAndServe(":"+port, router))
}