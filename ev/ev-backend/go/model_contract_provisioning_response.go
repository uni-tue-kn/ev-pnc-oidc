package ev_backend

type ContractProvisioningResponse struct {
	UserCode string `json:"user_code"`

	VerificationUri string `json:"verification_uri"`
}
