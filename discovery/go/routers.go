package discovery

import (
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

type Route struct {
	Name        string
	Method      string
	Pattern     string
	HandlerFunc http.HandlerFunc
}

type Routes []Route

func NewRouter() *mux.Router {
	router := mux.NewRouter().StrictSlash(true)
	for _, route := range routes {
		var handler http.Handler
		handler = route.HandlerFunc
		handler = Logger(handler, route.Name)

		router.
			Methods(route.Method).
			Path(route.Pattern).
			Name(route.Name).
			Handler(handler)
	}

	return router
}

func GetOpenIdConfiguration(w http.ResponseWriter, r *http.Request) {
	data, err := os.ReadFile("./openid-configuration.json")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// Write file content into HTTP response
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.Write(data)
	w.WriteHeader(http.StatusOK)
}

var routes = Routes{
	Route{
		"Index",
		"GET",
		"/",
		GetOpenIdConfiguration,
	},
}
