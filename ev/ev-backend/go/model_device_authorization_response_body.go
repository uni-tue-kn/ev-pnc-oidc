package ev_backend

type DeviceAuthorizationResponseBody struct {
	DeviceCode string `json:"device_code"`

	UserCode string `json:"user_code"`

	VerificationUri string `json:"verification_uri"`

	Interval uint32 `json:"interval"`

	VerificationUriComplete string `json:"verification_uri_complete"`

	ExpiresIn uint32 `json:"expires_in"`
}
