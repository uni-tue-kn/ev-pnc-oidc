package emsp_backend

import (
	"errors"
	"log"
	"os"
	"strings"
)

var Configuration struct {
	Port            string
	TrustedIssuer   string
	TrustedAudience string
	RequiredScopes  []string
	CsrDirectory    string
	CrtDirectory    string
	SigningCommand  string
	SigningArgs     []string
	JwksUri         string
}

func LoadConfiguration() error {
	// Load Trusted Issuer
	Configuration.TrustedIssuer = os.Getenv("TRUSTED_ISSUER")
	if Configuration.TrustedIssuer == "" {
		return errors.New("TRUSTED_ISSUER required!")
	}
	log.Printf("[CONFIG] Trusted Issuer is '" + Configuration.TrustedIssuer + "'")

	// Load JWKS URI
	Configuration.JwksUri = os.Getenv("JWKS_URI")
	if Configuration.JwksUri == "" {
		log.Printf("[CONFIG] JWKS URI not specified, using Discovery Document...")

		// Generate Discovery URL
		discoveryUrl := Configuration.TrustedIssuer + "/.well-known/openid-configuration"

		jwksUri, err := DiscoverJwksUri(discoveryUrl)
		if err != nil {
			return errors.New("Failed to discover JWKS URI: " + err.Error())
		}

		Configuration.JwksUri = jwksUri
	}
	log.Printf("[CONFIG] JWKS URI is '" + Configuration.JwksUri + "'")

	// Load Trusted Audience
	Configuration.TrustedAudience = os.Getenv("TRUSTED_AUDIENCE")
	if Configuration.TrustedAudience == "" {
		Configuration.TrustedAudience = "emsp_backend"
	}
	log.Printf("[CONFIG] Trusted Audience is '" + Configuration.TrustedAudience + "'")

	// Load Required Scopes
	requiredScopes := os.Getenv("REQUIRED_SCOPES")
	if requiredScopes == "" {
		requiredScopes = "csr"
	}
	Configuration.RequiredScopes = strings.Split(requiredScopes, ",")
	log.Printf("[CONFIG] Required Scopes are '" + requiredScopes + "'")

	// Load Port
	Configuration.Port = os.Getenv("PORT")
	if Configuration.Port == "" {
		Configuration.Port = "8080"
	}
	log.Printf("[CONFIG] Port is " + Configuration.Port)

	// Load CSR Directory
	Configuration.CsrDirectory = os.Getenv("CSR_DIR")
	if Configuration.CsrDirectory == "" {
		Configuration.CsrDirectory = "./csr"
	}
	log.Printf("[CONFIG] CSR Directory is '" + Configuration.CsrDirectory + "'")

	// Load CRT Directory
	Configuration.CrtDirectory = os.Getenv("CRT_DIR")
	if Configuration.CrtDirectory == "" {
		Configuration.CrtDirectory = "./crt"
	}
	log.Printf("[CONFIG] CRT Directory is '" + Configuration.CrtDirectory + "'")

	// Load Signing Command
	Configuration.SigningCommand = os.Getenv("SIGNING_CMD")
	if Configuration.SigningCommand == "" {
		Configuration.SigningCommand = "./scripts/sign-cert.sh"
	}
	log.Printf("[CONFIG] Signing Command is '" + Configuration.SigningCommand + "'")

	// Load Signing Arguments
	signingArgs := os.Getenv("SIGNING_ARGS")
	if signingArgs == "" {
		signingArgs = "${CSR_FILE} ${CRT_FILE}"
	}
	Configuration.SigningArgs = strings.Split(signingArgs, " ")
	log.Printf("[CONFIG] Signing Command is '" + strings.Join(Configuration.SigningArgs, " ") + "'")

	return nil
}

func ScopesValid(scopes []string) error {
	for i := 0; i < len(Configuration.RequiredScopes); i++ {
		requiredScope := Configuration.RequiredScopes[i]
		found := false
		for j := 0; j < len(scopes); j++ {
			scope := scopes[j]
			if scope == requiredScope {
				found = true
				break
			}
		}
		if !found {
			return errors.New("Scope '" + requiredScope + "' not found!")
		}
	}
	return nil
}
