package emsp_as

import (
	"bufio"
	"errors"
	"log"
	"os"
)

var Configuration struct {
	Port             string
	ServiceApiKey    string
	ServiceApiSecret string
	KeysDir          string
	UserCreds        string
}

func LoadConfiguration() error {
	// Load Port
	Configuration.Port = os.Getenv("PORT")
	if Configuration.Port == "" {
		Configuration.Port = "8080"
	}
	log.Printf("[CONFIG] Port is " + Configuration.Port)

	// Load Service API Key
	serviceApiKeyFile := os.Getenv("SERVICE_API_KEY_FILE")
	if serviceApiKeyFile == "" {
		Configuration.ServiceApiKey = os.Getenv("SERVICE_API_KEY")
		if Configuration.ServiceApiKey == "" {
			return errors.New("No Service API Key provided!")
		}
	} else {
		apiKey, err := ReadFirstLine(serviceApiKeyFile)
		if err != nil {
			return errors.Join(errors.New("Failed to read API Key File '"+serviceApiKeyFile+"'"), err)
		}
		Configuration.ServiceApiKey = apiKey
	}

	// Load Service API Key
	serviceApiSecretFile := os.Getenv("SERVICE_API_SECRET_FILE")
	if serviceApiSecretFile == "" {
		Configuration.ServiceApiSecret = os.Getenv("SERVICE_API_SECRET")
		if Configuration.ServiceApiSecret == "" {
			return errors.New("No Service API Secret provided!")
		}
	} else {
		apiSecret, err := ReadFirstLine(serviceApiSecretFile)
		if err != nil {
			return errors.Join(errors.New("Failed to read API Key File '"+serviceApiKeyFile+"'"), err)
		}
		Configuration.ServiceApiSecret = apiSecret
	}

	// Load Keys Directory
	Configuration.KeysDir = os.Getenv("KEYS_DIR")
	if Configuration.KeysDir == "" {
		Configuration.KeysDir = "./keys"
	}

	// Load User Credentials File
	Configuration.UserCreds = os.Getenv("USER_CREDS")
	if Configuration.UserCreds == "" {
		Configuration.UserCreds = "./config/users.json"
	}

	return nil
}

func ReadFirstLine(fileName string) (string, error) {
	file, err := os.Open(fileName)
	if err != nil {
		return "", err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		return scanner.Text(), nil
	}

	return "", errors.New("File is empty")
}
