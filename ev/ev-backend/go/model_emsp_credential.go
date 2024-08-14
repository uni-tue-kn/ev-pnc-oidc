package ev_backend

import (
	"encoding/json"
	"os"
)

var emspCredentials map[string]EmspCredential

func LoadClientCredentials(file string) error {
	// Read emsp file
	data, err := os.ReadFile(file)
	if err != nil {
		return err
	}

	// JSON serialize values
	err = json.Unmarshal(data, &emspCredentials)
	if err != nil {
		return err
	}

	return nil
}

func GetEmspCredential(clientId string) *EmspCredential {
	credential, found := emspCredentials[clientId]
	if found {
		return &credential
	} else {
		return nil
	}
}

type EmspCredential struct {
	ClientId string `json:"client_id"`

	// ClientSecret string `json:"client_secret"`
}
