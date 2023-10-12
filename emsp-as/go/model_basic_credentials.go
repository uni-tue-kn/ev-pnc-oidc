/*
 * eMSP Authorization Server
 *
 * Authorization Server of an e-Mobility Service Provider written in Go.
 *
 * API version: 0.0.0
 * Generated by: Swagger Codegen (https://github.com/swagger-api/swagger-codegen.git)
 */
package emsp_as

type BasicCredentials struct {
	Username string `json:"username"`
	Password string `json:"password"`
}
