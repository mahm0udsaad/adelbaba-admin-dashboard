replace
the
dummy
data
with live API
calls
using the
base
URL
you
provided (https://test.hgallerycandles.com). This guide assumes the UI pages have been built per the previous prompt and focuses on wiring them up to the backend endpoints.\
\
🔐 Authentication
\
Login
\
Endpoint: POST https://test.hgallerycandles.com/api/v1/admin/login
\
Request body: JSON { "email": "<admin-email>", "password": "<password>" }.
\
Response: On success, returns a JSON object with a token field and the logged‑in user’s details\
app.apidog.com
.
\
Implementation tips:\
\
Create a login form (if you haven’t already) that collects email and password.
\
On submit, send a fetch/axios POST request to the login endpoint.
\
Store the returned token in a secure place (e.g., localStorage or sessionStorage).
\
Set up an API client (e.g., with Axios interceptors) that automatically attaches Authorization: Bearer {token} to every subsequent request.
\
Token Handling
\
Implement logic to check for a stored token on app load
if absent, redirect to
login.
\
\
Handle 401/403 responses by clearing the token and redirecting to login.

📦 API Service Layer
\
Create a dedicated
module (e.g., api.js)
to
encapsulate
all
API
calls.Using
axios as an
example:
\
\
import axios from "axios"

const api = axios.create({
  baseURL: "https://test.hgallerycandles.com/api/v1/admin",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle responses/errors globally if needed
export default api

\
This service will be used throughout the app to call specific endpoints.

📄 Endpoints & Integration by Page
\
Below is a mapping of each page to the appropriate API endpoints, including key request/response shapes. Replace dummy data
with calls to
these
functions in your
components.
\

Companies

List Companies:
GET /companies → returns paginated array of companies
app.apidog.com
.

export const fetchCompanies = () => api.get("/companies")

Show
Company:
\
GET /companies/
{
  companyId
}
→ returns one company’s details
app.apidog.com
.

Create Company:\
POST /companies
with multipart/form-data for fields like name, region_id, city_id, logo, owner info, contacts, etc.
app.apidog.com
app.apidog.com.Update
Company:
\
PATCH /companies/
{
  companyId
}
with JSON fields
such as is_active, platforms[], is_verified
app.apidog.com.Delete
Company:
\
DELETE /companies/
{
  companyId
}
app.apidog.com
.
\
When you call fetchCompanies, update the table state
with the returned
data.Use
query
parameters
for pagination or searching (e.g., ?page=1&search=Acme), if supported;
otherwise
filter
client
‑side.
\
Users

List Users: GET /users
app.apidog.com
.

Show User: GET /users/
{
  id
}
app.apidog.com
.
\
Create User: POST /users
with JSON body
containing
name, email, phone, region_id, password
and
company_name
app.apidog.com.Update
User: PUT / users / { id }
app.apidog.com.Delete
User: DELETE / users / { id }
app.apidog.com.Tie
the
search / filter in the
Users
page
to
query
parameters
or
front
‑end filtering.

Roles & Permissions

List Roles: GET /roles → returns array of roles
with id, name, permissions_count
app.apidog.com
.

Show
Role: GET /roles/{roleId} (will include role name and permissions).

Create
Role: POST / roles
with { "name": "Support", "permissions": [1, 3, 4] }
app.apidog.com.Update
Role: PUT / roles / { roleId }
with same body
shape
app.apidog.com.Delete
Role: DELETE / roles / { roleId }
app.apidog.com.List
Permissions: GET / roles / permissions
→ returns an array of permission objects
app.apidog.com
.

Use these endpoints to populate your roles table and show a modal listing permissions when a row is clicked.

Admins & Employees

List Admins/Employees: GET /management?
type = admin
or ?type=employee
app.apidog.com
.

Show
: GET /management/
{
  id
}
.

Create: POST /management
with JSON (name, email, phone, password, roles array, type, is_active)
app.apidog.com
.

Update
: PUT /management/
{
  id
}
with similar body
app.apidog.com.Delete
: DELETE /management/
{
  id
}
app.apidog.com.Tie
your
“Admins & Employees” page filters to the
type query parameter.

Support
Tickets

List
Tickets: GET / support - tickets
→ returns paginated array of tickets
with fields like
id, ticket_number, issue_subject, priority, category, status, created_at, assignedTo, and
user
info
app.apidog.com.List
Assigned
Tickets: GET / support - tickets / assigned
for tickets assigned to current
admin.Show
Ticket: GET / support - tickets / { ticketId }.Show
Ticket
Logs: GET / support - ticket - logs.Reply
: POST /support-tickets/
{
  ticketId
}
;/ ().7aaaaaabccddeeeegghhiiiillmmnnnnnnoooopprsssttttttwyy{}

Update
Ticket: PATCH / support - tickets / { ticketId }
with fields like
status
and
priority.Change
Assignee: PATCH / support - tickets / { ticketId } / assign
with assignee_id.

Delete Ticket: DELETE /support-tickets/{ticketId}.

Your
tickets
page
should
call
fetchTickets()
on
mount
and
implement
filters
for priority, category, status, and assigned admin. Use modals
for detail view and reply
form.Subscriptions
– Plans & Features

List Plans: GET /subscriptions/plans
app.apidog.com
.

Show Plan: GET /subscriptions/plans/
{
  id
}
→ returns plan
with features array
app.apidog.com.Create
Plan: POST / subscriptions / plans
with {"name","payment_rate","price","support_level","features":[featureIds]}
app.apidog.com.Update
Plan: PUT / subscriptions / plans / { id }
app.apidog.com.List
Features: GET / subscriptions / features
app.apidog.com.Show
Feature: GET / subscriptions / features / { id }
app.apidog.com.Create
Feature: POST / subscriptions / features
with {"name":"..."}

app.apidog.com.Update
Feature: PUT / subscriptions / features / { id }
app.apidog.com.Delete
Feature: DELETE / subscriptions / features / { id }
app.apidog.com.Use
these
calls
to
populate
the
Plans
and
Features
pages.You
may
need
to
fetch
features
first
to
display
names
when
creating
or
editing
a
plan.Ads

List
Ads: GET / ads
→ returns array of ads
with fields like
id, title, status, type, location, starts_at, ends_at, target_url, user, media
app.apidog.com.Show
Ad: GET / ads / { id }
app.apidog.com.Create
Ad: POST / ads
with multipart/form-data containing
title, type, location, start / end
dates, target_url, and
optional
media
files
app.apidog.com.Update
Ad: PUT / ads / { id }
with JSON (title, status, type, location, dates, target_url)
app.apidog.com
.

Add
Media
to
Ad: POST / ads / { id } / media
with media[] file
attachments
app.apidog.com.Delete
Media: DELETE / ads / { id } / media / { mediaId }
app.apidog.com.Delete
Ad: DELETE /ads/{id} (not fully captured but implied).

Wire
these
methods
to
the
Ads
page: fetch
the
list
on
load
allow
editing
and
uploading
new media()
via
forms
display
media
thumbnails.Products
– Units, Variations, Variation Values

Units:

List: GET /units
app.apidog.com
.

Create: POST /units
with {"name": "Kilogram"}
app.apidog.com.Show
: GET /units/
{
  id
}
app.apidog.com.Update
: PUT /units/
{
  id
}
app.apidog.com.Delete
: DELETE /units/
{
  id
}
app.apidog.com.Variations
:

List: GET /variations
app.apidog.com
.

Show: GET /variations/
{
  id
}
app.apidog.com.Create
: Some documentation suggests the endpoint is POST /variations
with body {"name": "Size"}
. (In Apidog UI it was mislabelled as /units, so verify the correct path.)

Update: PUT /variations/
{
  id
}
(body
{
  ;("name")
  : "Size"
}
).

Delete: DELETE /variations/
{
  id
}
app.apidog.com.Variation
Values: List: GET / variations / { variationId } / values
app.apidog.com.Show
: GET /variations/
{
  variationId
}
;/values/
{
  id
}
app.apidog.com.Create
: POST /variations/
{
  variationId
}
;/ """"3:DERaaeehillstuuvvw{{}}
app.apidog.com.Update
: PUT /variations/
{
  variationId
}
;/values/
{
  id
}
with {"value":"BLACK"}
app.apidog.com.Delete
: DELETE /variations/
{
  variationId
}
;/values/
{
  id
}
(not
captured
but
expected
to
return a
success
message
).

Use these endpoints to build the Units, Variations, and Variation Values pages. For Variation Values, ensure the UI first selects a variation, then fetches its values.

Products (General)

The product endpoints
for listing, showing details, creating, and updating products
include
complex
JSON
with nested variations
and
media
app.apidog.com.Because
we
didn
’t capture every detail, you should:

Start by implementing GET /products to populate the products table.

For editing, follow the pattern shown: send product details plus arrays
for media.add/remove and variations.add/remove to /products/{id} (using PUT or PATCH depending on the API spec).

For
creation, send
similar
payload
to
POST / products.Delete
via
DELETE /products/{id} (if provided).

🧠 Search & Filter Integration

Where the API supports query parameters (e.g., ?search=name&status=active&page=1), incorporate those directly in api.get(). If the API doesn’t support filtering, fetch all items and perform filtering on the client side.

Always update the URL or local state to reflect current search/filter values so the UI stays in sync.

⚠️ Error Handling & UX Considerations

Show loading spinners
while data is
being
fetched.Display
error
messages
if API requests
fail.Use
confirmation
dialogs
for destructive actions (delete operations).

Format dates according
to
the
Africa / Cairo
timezone (e.g., using Intl.DateTimeFormat).

Validate
forms
before
sending
requests
handle
both
validation
errors
and
server
errors
gracefully.
