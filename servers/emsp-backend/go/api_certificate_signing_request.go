package emsp_backend

import (
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path"
	"strings"
	"time"

	"github.com/google/uuid"
)

var LogWriter *os.File = nil

func DownloadCsr(r *http.Request) (string, error) {
	measureStart := time.Now()
	// Create CSR Directory if not exists
	_, err := os.Stat(Configuration.CsrDirectory)
	if os.IsNotExist(err) {
		err = os.Mkdir(Configuration.CsrDirectory, 0755)
		if err != nil {
			return "", errors.Join(errors.New("Failed to create CSR Directory"), err)
		}
	} else if err != nil {
		return "", errors.New("Failed to access CSR Directory")
	}

	// Prepare CSR ID, file name, and file path
	csrId := uuid.NewString()
	csrFileName := csrId + ".csr"
	csrFilePath := path.Join(Configuration.CsrDirectory, csrFileName)

	// Create CSR File
	csrFile, err := os.Create(csrFilePath)
	if err != nil {
		return "", errors.Join(errors.New("Failed to create CSR File '"+csrFilePath+"'"), err)
	}
	defer csrFile.Close()

	// Copy HTTP CSR Body from HTTP POST Body to CSR File
	_, err = io.Copy(csrFile, r.Body)
	if err != nil {
		return "", errors.Join(errors.New("Failed to download CSR to '"+csrFilePath+"'"), err)
	}

	measureEnd := time.Now()
	measureDuration := time.Since(measureStart)
	if LogWriter != nil {
		_, err := LogWriter.WriteString("download_csr," + fmt.Sprint(measureStart.UnixNano()) + "," + fmt.Sprint(measureEnd.UnixNano()) + "," + fmt.Sprint(measureDuration.Nanoseconds()) + "\r\n")
		if err != nil {
			log.Printf("Writing measurement failed: " + err.Error())
		}
	}

	return csrId, nil
}

func SignCsr(csrPath string, crtPath string) error {
	measureStart := time.Now()

	// Prepare signing command
	var signingArgs []string
	for i := 0; i < len(Configuration.SigningArgs); i++ {
		arg := Configuration.SigningArgs[i]
		arg = strings.ReplaceAll(arg, "${CSR_FILE}", csrPath)
		arg = strings.ReplaceAll(arg, "${CRT_FILE}", crtPath)
		signingArgs = append(signingArgs, arg)
	}

	// Sign downloaded CSR
	cmd := exec.Command(Configuration.SigningCommand, signingArgs...)
	_, err := cmd.CombinedOutput()
	if err != nil {
		return errors.Join(errors.New("Failed to sign CSR"), err)
	}

	measureEnd := time.Now()
	measureDuration := time.Since(measureStart)
	if LogWriter != nil {
		_, err := LogWriter.WriteString("sign_csr," + fmt.Sprint(measureStart.UnixNano()) + "," + fmt.Sprint(measureEnd.UnixNano()) + "," + fmt.Sprint(measureDuration.Nanoseconds()) + "\r\n")
		if err != nil {
			log.Printf("Writing measurement failed: " + err.Error())
		}
	}

	return nil
}

func SendCrt(crtPath string, w *http.ResponseWriter) error {
	measureStart := time.Now()

	crtFile, err := os.Open(crtPath)
	if err != nil {
		return errors.Join(errors.New("Failed to open CRT File"), err)
	}
	defer crtFile.Close()

	_, err = io.Copy(*w, crtFile)
	if err != nil {
		return errors.Join(errors.New("Failed to copy CRT File"), err)
	}

	measureEnd := time.Now()
	measureDuration := time.Since(measureStart)
	if LogWriter != nil {
		_, err := LogWriter.WriteString("send_csr," + fmt.Sprint(measureStart.UnixNano()) + "," + fmt.Sprint(measureEnd.UnixNano()) + "," + fmt.Sprint(measureDuration.Nanoseconds()) + "\r\n")
		if err != nil {
			log.Printf("Writing measurement failed: " + err.Error())
		}
	}

	return nil
}

func PostCsr(w http.ResponseWriter, r *http.Request) {
	measureStart := time.Now()

	// Validate Content Type
	contentType := r.Header.Get("content-type")
	if contentType != "application/pkcs10" {
		log.Printf("Invalid Content Type")
		http.Error(w, "Invalid Content Type", http.StatusBadRequest)
		return
	}

	// Download CSR from HTTP POST Body to new CSR File
	csrId, err := DownloadCsr(r)
	if err != nil {
		log.Printf(err.Error())
		http.Error(w, "Internal Server Error. See log.", http.StatusInternalServerError)
		return
	}

	// Prepare CSR Path
	csrFile := csrId + ".csr"
	csrPath := path.Join(Configuration.CsrDirectory, csrFile)

	// Prepare CRT Path
	crtFile := csrId + ".crt"
	crtPath := path.Join(Configuration.CrtDirectory, crtFile)

	// Sign CSR
	err = SignCsr(csrPath, crtPath)
	if err != nil {
		log.Printf(err.Error())
		http.Error(w, "Internal Server Error. See log.", http.StatusInternalServerError)
		return
	}

	// Send CRT File in response body
	w.Header().Set("Content-Type", "application/x-x509-user-cert; charset=UTF-8")
	w.WriteHeader(http.StatusCreated)
	err = SendCrt(crtPath, &w)
	if err != nil {
		log.Printf(err.Error())
		http.Error(w, "Internal Server Error. See log.", http.StatusInternalServerError)
		return
	}

	measureEnd := time.Now()
	measureDuration := time.Since(measureStart)
	if LogWriter != nil {
		_, err := LogWriter.WriteString("csr," + fmt.Sprint(measureStart.UnixNano()) + "," + fmt.Sprint(measureEnd.UnixNano()) + "," + fmt.Sprint(measureDuration.Nanoseconds()) + "\r\n")
		if err != nil {
			log.Printf("Writing measurement failed: " + err.Error())
		}
	}
}
