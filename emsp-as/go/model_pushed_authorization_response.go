/*
 * eMSP Authorization Server
 *
 * Authorization Server of an e-Mobility Service Provider written in Go.
 *
 * API version: 0.0.0
 * Generated by: Swagger Codegen (https://github.com/swagger-api/swagger-codegen.git)
 */
package emsp_as

type PushedAuthorizationResponse struct {
	RequestUri string `json:"request_uri"`
	// Lifetime of Request URI in seconds.
	ExpiresIn int32 `json:"expires_in"`
}
