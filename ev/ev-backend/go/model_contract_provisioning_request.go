package ev_backend

type ContractProvisioningRequest struct {
	EmspId string `json:"emsp_id"`

	AuthorizationDetail *AuthorizationDetail `json:"authorization_detail"`
}
