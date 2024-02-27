package emsp_backend

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/lestrrat-go/jwx/jwk"
)

var JwksStore []jwk.Key

func GetKey(keyId string) *jwk.Key {
	for i := 0; i < len(JwksStore); i++ {
		jwk := JwksStore[i]
		kid := jwk.KeyID()
		if kid == keyId {
			return &jwk
		}
	}

	return nil
}

func DiscoverJwksUri(discoveryUrl string) (string, error) {
	// Request Discovery Document
	resp, err := http.Get(discoveryUrl)
	if err != nil {
		return "", errors.New("Failed to request discovery document")
	}
	defer resp.Body.Close()

	// Extract JWKS URI from Discovery Document
	var discoveryData struct {
		JwksURI string `json:"jwks_uri"`
	}
	err = json.NewDecoder(resp.Body).Decode(&discoveryData)
	if err != nil {
		return "", errors.New("Failed to parse discovery document")
	}
	if discoveryData.JwksURI == "" {
		return "", errors.New("JWKS URI not found")
	}

	return discoveryData.JwksURI, nil
}

func GetJwks(jwksUri string) ([]jwk.Key, error) {
	// Request JWKS Document
	resp, err := http.Get(jwksUri)
	if err != nil {
		return []jwk.Key{}, errors.New("Failed to request JWKS document")
	}
	defer resp.Body.Close()

	// Parse JWKS Document
	var jwksDocument struct {
		keys []jwk.Key
	}
	err = json.NewDecoder(resp.Body).Decode(&jwksDocument)
	if err != nil {
		return []jwk.Key{}, errors.New("Failed to parse JWKS document")
	}

	return jwksDocument.keys, nil
}

func LoadJwks(jwksUri string) error {
	// Discover keys and store them in jwksStore
	var err error
	JwksStore, err = GetJwks(jwksUri)

	// Return error if exists
	return err
}
