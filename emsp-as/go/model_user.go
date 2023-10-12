package emsp_as

type User struct {
	Username   string `json:"username"`
	Password   string `json:"password"`
	Name       string `json:"name"`
	FamilyName string `json:"family_name"`
	FirstName  string `json:"first_name"`
}
