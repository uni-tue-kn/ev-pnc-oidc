package emsp_backend

import (
	"log"
	"os"
	"strings"
)

var Configuration struct {
	Port           string
	CsrDirectory   string
	CrtDirectory   string
	SigningCommand string
	SigningArgs    []string
}

func LoadConfiguration() error {
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
