package ev_backend

type DeviceAuthorizationResponseBody struct {
	UserCode string `json:"user_code"`
	
	DeviceCode string `json:"device_code"`
	
	Interval uint32 `json:"interval"`
	
	VerificationUriComplete string `json:"verification_uri_complete"`
	
	VerificationUri string `json:"verification_uri"`
	
	ExpiresIn uint32 `json:"expires_in"`
}
