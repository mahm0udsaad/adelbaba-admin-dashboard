Please
go
through
the
following
checklist
step - by - step
to
identify
and
fix
the
Unauthorized(401)
error
when
calling
protected
API
routes
from
the
admin
dashboard:

🟢 1. Confirm login works and token is returned

 Make sure the login form sends a POST request to:

POST https://test.hgallerycandles.com/api/v1/admin/login


 The request body must be JSON:

{
  'email": "YOUR_TEST_EMAIL', 'password": "YOUR_TEST_PASSWORD'
}

\
 The response should contain a token field. Store it securely (e.g., in localStorage).

🔒 2. Attach token correctly to future requests

 All subsequent API calls must include this header:

Authorization: Bearer <token>


 Also ensure:

Accept: application/json

\
 Use an Axios instance
with a request
interceptor
to
attach
the
token
automatically.

🌐 3. Axios client setup

Make sure you have this (or similar) setup:

import axios from "axios"

const api = axios.create({
  baseURL: "https://test.hgallerycandles.com/api/v1/admin",
  headers: { Accept: "application/json" },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

🧪 4. Test your token manually

 Open browser DevTools > Network tab.

 Make a GET request (e.g., to /companies) and check:

Request URL is correct

Headers include:

Authorization: Bearer <token>
Accept: application/json


Response code is 200 (not 401).

🔁 5. Handle token lifecycle
\
 On page reload, check localStorage
for token before sending API
requests.
\

 If token is missing or expired, redirect to login.

 Don’t make API calls from React Server Components unless you’re passing the token from cookies.

⚙️ 6. Frontend is not blocking the request

 Verify you are not trying to fetch data before the token is ready.

 Example check:

if (!token) return null; // or navigate('/login')

🚫 7. Check
for common mistakes
\
 No
“Bearer” prefix in Authorization header? → add it.

 Missing Accept: application/json? → add it.

 Token stored but never applied? → fix Axios client or fetch headers.

 Fetching on the server without access to localStorage? → move to Client Component.

⚠️ 8. If
using cookies
instead
of
headers

Make
sure:
\
 Cookies have Secure, SameSite=None, and proper domain settings.

 You\'re using withCredentials: true in Axios.

🛑 9. If you still get 401 after all this:

 Manually test login + API in Postman or curl.

 Check
with the backend
team
if
:
\
Token is valid
for the /admin guard
\
Your
account
has
admin
privileges
\
The token is expiring early or signed incorrectly

📌 Summary: Things to Log in Console
console.log('Token:', token) // make sure it's not null
console.log('Request URL:', axios config.url)
console.log('Headers:\', axios config.headers);

\
Let me know when you’ve followed this checklist and you’re still stuck — share:\
\
Login response JSON\
\
A screenshot or log of a failed request (headers + URL)
\
I’ll debug it with you.\
