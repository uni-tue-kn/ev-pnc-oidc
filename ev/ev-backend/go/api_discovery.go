/*
 * EV Backend
 *
 * API version: 0.0.1
 * Generated by: Swagger Codegen (https://github.com/swagger-api/swagger-codegen.git)
 */
package ev_backend

import (
	"encoding/json"
	"net/http"
	"os"
)

/// List of supported eMSPs.
var Emsps []Emsp

func ReadEmsps(file string) ([]Emsp, error) {
	// Read emsp file
	data, err := os.ReadFile(file)
	if err != nil {
		return nil, err
	}

	// JSON parse emsps array
	var emsps []Emsp
	err = json.Unmarshal(data, &emsps)
	if err != nil {
		return nil, err
	}

	return emsps, nil
}

func GetEmsps(w http.ResponseWriter, r *http.Request) {
	// JSON serialize list of supported eMSPs.
	data, err := json.Marshal(Emsps)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// Return serialized eMSPs in HTTP JSON-encoded response
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.Write(data)
	w.WriteHeader(http.StatusOK)
}
