API_KEY="AIzaSyBq0BXktt8KtzmiLEilf_XcD8ZgWsfsfu0"
curl -s -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$API_KEY" \
-H "Content-Type: application/json" \
-d '{"email":"773303455@kayansoft.com","password":"0808kayan","returnSecureToken":true}' > auth.json
