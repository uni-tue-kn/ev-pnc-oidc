package ev_backend

type ParResponseBody struct {
	RequestUri string `json:"request_uri"`
	ExpiresIn  int64  `json:"expires_in"`
}
