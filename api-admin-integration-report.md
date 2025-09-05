Authentication
Endpoint	Request (method, params/body)	Response observed
POST /api/v1/admin/login	Body: { "email": "test@example.com", "password": "password" }.	200 OK. Returns a JSON object with message, a user object (id, name, picture, email, phone, company_name), an array of roles, and a JWT token
example: 
{
    "message": "User authenticated successfully",
    "user": {
        "id": 1,
        "name": "Test User",
        "picture": "https://placehold.co/200/png?text=No+Image",
        "email": "test@example.com",
        "phone": "857.749.9118",
        "company_name": "Abbott PLC",
        "unread_notifications_count": 0
    },
    "roles": [
        "Super-Admin",
        "Owner"
    ],
    "token": "130|37saj41FBOWndxdavWik93qE5SpCrJTsdnhQBlLib4c315db"
}
.
Company management (Admin side)
Endpoint	Request details	Response observed
GET /api/v1/admin/companies	No parameters.	200 OK. Returns data array of companies; each has id, name, description, founded_year, is_active, etc
{
    "data": [
        {
            "id": 16,
            "name": "Lelah Koelpin",
            "description": "Rerum aut voluptatibus ut maxime. Qui veritatis qui voluptatibus nobis. Dolor aperiam et nemo quia non maiores maxime. Quos et et error cum magnam unde.",
            "founded_year": 2009,
            "is_active": true,
            "verified_at": "2025-08-19T16:57:47.000000Z",
            "location": "Cayman Islands",
            "created_at": "2025-08-19T16:57:47.000000Z",
            "company_type": "trader",
            "platforms": null,
            "is_supplier": true,
            "is_buyer": false,
            "logo": "https://test.hgallerycandles.com/storage/626/1.png",
            "owner": {
                "id": 17,
                "name": "Prof. Sheldon Fay",
                "picture": "https://placehold.co/200/png?text=No+Image",
                "email": "lenora08@example.net",
                "phone": "+1.215.899.2522",
                "company_name": "Goodwin, Langworth and O'Kon",
                "unread_notifications_count": 0
            },
            "region": {
                "id": 1,
                "name": "Sweden",
                "picture": "https://flagsapi.com/SE/flat/64.png"
            },
            "state": {
                "id": 4,
                "name": "Carolyne Purdy"
            },
            "city": {
                "id": 16,
                "name": "Mr. Jedediah Nienow"
            }
        },
.
GET /api/v1/admin/companies/{companyId}	Path companyId (e.g., 3).	200 OK. Returns company details for the given id; includes name, description, founded_year, is_active, etc
    "data": {
        "id": 16,
        "name": "Lelah Koelpin",
        "description": "Rerum aut voluptatibus ut maxime. Qui veritatis qui voluptatibus nobis. Dolor aperiam et nemo quia non maiores maxime. Quos et et error cum magnam unde.",
        "founded_year": 2009,
        "is_active": true,
        "verified_at": "2025-08-19T16:57:47.000000Z",
        "location": "Cayman Islands",
        "created_at": "2025-08-19T16:57:47.000000Z",
        "company_type": "trader",
        "platforms": null,
        "is_supplier": true,
        "is_buyer": false,
        "logo": "https://test.hgallerycandles.com/storage/626/1.png",
        "documents": [],
        "contacts": [],
        "owner": {
            "id": 17,
            "name": "Prof. Sheldon Fay",
            "picture": "https://placehold.co/200/png?text=No+Image",
            "email": "lenora08@example.net",
            "phone": "+1.215.899.2522",
            "company_name": "Goodwin, Langworth and O'Kon",
            "unread_notifications_count": 0
        },
        "region": {
            "id": 1,
            "name": "Sweden",
            "picture": "https://flagsapi.com/SE/flat/64.png"
        },
        "state": {
            "id": 4,
            "name": "Carolyne Purdy"
        },
        "city": {
            "id": 16,
            "name": "Mr. Jedediah Nienow"
        }
    }
.
POST /api/v1/admin/companies	Form-data fields: name, description, founded_year, is_active, location, company_type.	422 Unprocessable Entity when using example placeholders. Response lists errors indicating required fields must not use placeholder values
formdata.append("name", "Hardware Market");
formdata.append("description", "Hardware market description hereee...");
formdata.append("founded_year", "2008");
formdata.append("is_active", "true");
formdata.append("location", "Dufferin Street, Dufferin Mall");
formdata.append("company_type", "manufacturer");
formdata.append("platforms[]", "facebook");
formdata.append("platforms[]", "website");
formdata.append("region_id", "2");
formdata.append("state_id", "8");
formdata.append("city_id", "37");
formdata.append("is_verified", "false");
formdata.append("logo", fileInput.files[0], "C:\Users\Bodda\OneDrive\Desktop\44c89539e9b2ae7ffc7d1926f355ff8eafac4dde.png");
formdata.append("contacts[0][phone]", "458632100");
formdata.append("contacts[0][email]", "abdos1166@gmail.com");
formdata.append("contacts[0][is_primary]", "1");
formdata.append("contacts[1][phone]", "4586321001");
formdata.append("contacts[1][email]", "abdos11066@gmail.com");
formdata.append("documents[]", fileInput.files[0], "C:\Users\Bodda\OneDrive\Documents\Math 3\m4 .pdf"]");
formdata.append("documents[]", fileInput.files[0], "C:\Users\Bodda\OneDrive\Documents\Math 3\m10.pdf");
formdata.append("owner[name]", "AbdelRahman Saad");
formdata.append("owner[email]", "test@gmail.com");
formdata.append("owner[phone]", "054568882");
formdata.append("owner[region_id]", "4");
formdata.append("owner[password]", "password");
formdata.append("owner[password_confirmation]", "password");

.
PATCH /api/v1/admin/companies/{companyId}	JSON body (e.g., {"is_active":true,"platforms":["facebook","google"],"is_verified":true}) and companyId=3.	200 OK. Response contains message: "Company updated successfully."
app.apidog.com
.
DELETE /api/v1/admin/companies/{companyId}	Path companyId=3.	200 OK. Response: {"message":"Company deleted successfully."}
app.apidog.com
.
User management
Endpoint	Request details	Response observed
GET /api/v1/admin/users	No parameters.	200 OK. Returns data array of users with fields like id, name, email, phone, company_name, unread_notifications_count, timestamps
{
    "data": [
        {
            "id": 1,
            "name": "Test User",
            "picture": "https://placehold.co/200/png?text=No+Image",
            "email": "test@example.com",
            "phone": "857.749.9118",
            "company_name": "Abbott PLC",
            "unread_notifications_count": 0
        },
        .
GET /api/v1/admin/users/{userId}	Path userId=1.	200 OK. Returns user detail identical to list entry
{
    "data": {
        "id": 1,
        "name": "Test User",
        "picture": "https://placehold.co/200/png?text=No+Image",
        "email": "test@example.com",
        "phone": "857.749.9118",
        "company_name": "Abbott PLC",
        "unread_notifications_count": 0
    }
}.
POST /api/v1/admin/users	Body: { "name": "Test", "email": "test@example.com", "phone": "0123456789", "region_id": 1, "password": "secret", "password_confirmation": "secret", "company_name": "Acme" }.	Returned 200 (not 201). Response contained the existing user record rather than new; Validate panel flagged missing message and incorrect status code
app.apidog.com
.
PUT /api/v1/admin/users/{userId}	Body similar to create; path userId=1.	200 OK. Response: {"message":"User updated successfully."}
app.apidog.com
.
DELETE /api/v1/admin/users/{userId}	Path userId=1.	(Testing not completed; after our last context this remained pending.)
Roles & Permissions (Management)
Endpoint	Request details	Response observed
GET /api/v1/admin/roles/permissions	No parameters.	200 OK. Returns data array (empty in our test)
app.apidog.com
.
GET /api/v1/admin/roles	No parameters.	200 OK. Returns data array with each role’s id, name, permissions_count
app.apidog.com
.
GET /api/v1/admin/roles/{roleId}	RoleId=1.	200 OK. Returns data with id=1, name="Super-Admin", empty permissions array
app.apidog.com
.
POST /api/v1/admin/roles	Body: { "name":"Support", "permissions":[1,3,4] }.	422 Unprocessable Entity. Response: validation error "The selected permissions.0 is invalid" for each item
app.apidog.com
.
PUT /api/v1/admin/roles/{roleId}	Body same as create; roleId=1.	422 with similar invalid permissions errors
app.apidog.com
.
DELETE /api/v1/admin/roles/{roleId}	RoleId=1.	404 Not Found. Response: {"message":"Role not found"}
app.apidog.com
.
Admins & Employees (Management)
Endpoint	Request details	Response observed
GET /api/v1/admin/management	Optional query type ("admin" or "employee").	200 OK. Returns pagination info and an empty data array (no admin/employee records)
app.apidog.com
.
GET /api/v1/admin/management/{entityId}	Path entityId=1.	404 Not Found with message "User not found"
app.apidog.com
.
POST /api/v1/admin/management	Body: { "name":"AA", "email":"a@a.com", "phone":"01234", "password":"pass", "password_confirmation":"pass", "roles":[1,3], "type":"admin", "is_active":true }.	422 Unprocessable Entity. Response: "The selected roles.1 is invalid"
app.apidog.com
.
PUT /api/v1/admin/management/{entityId}	Body similar to create; path entityId=1.	422 with same invalid roles error
app.apidog.com
.
DELETE /api/v1/admin/management/{entityId}	entityId=628.	404 Not Found: "User not found"
app.apidog.com
.
Support tickets
Endpoint	Request details	Response observed
GET /api/v1/admin/support-tickets	No parameters.	200 OK. data array of tickets; each includes id, ticket_number, issue_subject, issue_description, priority, category, status, created_at, updated_at
{
    "data": [
        {
            "id": 1,
            "ticket_number": "TKT-68A4AD93E614C",
            "issue_subject": "Sit rerum aliquam aliquam quo porro nihil.",
            "issue_description": "Totam ipsum id omnis veritatis aut iure. Officia molestiae rerum ex aspernatur libero praesentium ducimus. Dolores in asperiores totam. Ut temporibus iusto aperiam et.",
            "priority": "low",
            "category": "billing",
            "status": "in_progress",
            "created_at": "2025-08-19T17:00:03.000000Z",
            "updated_at": "2025-08-19T17:00:03.000000Z",
            "assignedTo": "Alexander Bartell",
            "user": {
                "id": 1,
                "name": "Test User",
                "picture": "https://placehold.co/200/png?text=No+Image",
                "email": "test@example.com",
                "phone": "857.749.9118",
                "company_name": "Abbott PLC",
                "unread_notifications_count": 0
            }
        },
        .
GET /api/v1/admin/support-tickets/{ticketId}	ticketId=10.	200 OK. Returns a data object with detailed fields (id, ticket_number, issue_subject, issue_description, priority, category, status, created_at, updated_at, etc.)
app.apidog.com
.
GET /api/v1/admin/support-tickets/{ticketId}/logs	ticketId=10.	200 OK. Returns data array of log entries; each log has id, message, created_at, and a nested user object (id, name, email, etc.)
{
    "data": {
        "id": 1,
        "ticket_number": "TKT-68A4AD93E614C",
        "issue_subject": "Sit rerum aliquam aliquam quo porro nihil.",
        "issue_description": "Totam ipsum id omnis veritatis aut iure. Officia molestiae rerum ex aspernatur libero praesentium ducimus. Dolores in asperiores totam. Ut temporibus iusto aperiam et.",
        "priority": "low",
        "category": "billing",
        "status": "in_progress",
        "created_at": "2025-08-19T17:00:03.000000Z",
        "updated_at": "2025-08-19T17:00:03.000000Z",
        "assignedTo": "Alexander Bartell",
        "user": {
            "id": 1,
            "name": "Test User",
            "picture": "https://placehold.co/200/png?text=No+Image",
            "email": "test@example.com",
            "phone": "857.749.9118",
            "company_name": "Abbott PLC",
            "unread_notifications_count": 0
        }
    }
}.
POST /api/v1/admin/support-tickets/{ticketId} (reply)	ticketId=10. Body: { "message": "Please send the invoice id so we can help you." }.	201 Created. Response: "Response sent successfully."
app.apidog.com
.
PATCH /api/v1/admin/support-tickets/{ticketId}	ticketId=10. I sent an empty JSON body (but you can include priority, category, status).	200 OK. Response: "Ticket updated successfully."
app.apidog.com
.
PATCH /api/v1/admin/support-tickets/{ticketId}/assign	ticketId=10, body { "assigned_to": 1 }.	404 Not Found with message "Assignee not found or not authorized."
app.apidog.com
.
DELETE /api/v1/admin/support-tickets/{ticketId}	ticketId=10.	200 OK. Response: "Ticket deleted successfully."
app.apidog.com
.
Subscriptions
Plans
Endpoint	Request details	Response observed
GET /api/v1/admin/subscriptions/plans	Lists all plans.	Response structure includes data (no example values given) and pagination meta
{
    "data": [],
    "links": {
        "first": "https://test.hgallerycandles.com/api/v1/admin/subscriptions/plans?page=1",
        "last": "https://test.hgallerycandles.com/api/v1/admin/subscriptions/plans?page=1",
        "prev": null,
        "next": null
    },
    "meta": {
        "current_page": 1,
        "from": null,
        "last_page": 1,
        "links": [
            {
                "url": null,
                "label": "&laquo; Previous",
                "active": false
            },
            {
                "url": "https://test.hgallerycandles.com/api/v1/admin/subscriptions/plans?page=1",
                "label": "1",
                "active": true
            },
            {
                "url": null,
                "label": "Next &raquo;",
                "active": false
            }
        ],
        "path": "https://test.hgallerycandles.com/api/v1/admin/subscriptions/plans",
        "per_page": 15,
        "to": null,
        "total": 0
    }
}.
GET /api/v1/admin/subscriptions/plans/{id}	Path id (e.g., 1).	200 OK. Returns data object with plan details (id, name, payment_rate, price, support_level, timestamps) and nested features array
app.apidog.com
.
POST /api/v1/admin/subscriptions/plans	Body: { "name": "Silver", "payment_rate": "monthly", "price": 40, "support_level": "basic", "features": [1,2] }.	201 Created. Response returns message and a data object containing created plan details and features
app.apidog.com
.
PUT /api/v1/admin/subscriptions/plans/{id}	Body similar to create.	200 OK. Response returns message and updated plan data
app.apidog.com
.
DELETE /api/v1/admin/subscriptions/plans/{id}	Body includes the plan ID.	200 OK. Response: "Plan deleted successfully"
app.apidog.com
.
Features
Endpoint	Request details	Response observed
GET /api/v1/admin/subscriptions/features	No parameters.	Response contains data array and pagination meta (no sample data)
app.apidog.com
.
GET /api/v1/admin/subscriptions/features/{id}	Path id.	200 OK. Returns object with id and name
app.apidog.com
.
POST /api/v1/admin/subscriptions/features	Body: { "name": "Full Support 24/7" }.	201 Created. Returns message and created feature (id, name)
app.apidog.com
.
PUT /api/v1/admin/subscriptions/features/{id}	Body: { "name": "Diamond Plan" }.	200 OK. Returns message and updated feature (id, name)
app.apidog.com
.
DELETE /api/v1/admin/subscriptions/features/{id}	Deletes feature.	200 OK. Response: "Feature deleted successfully"
app.apidog.com
.
Ads Management
Endpoint	Request details	Response observed
GET /api/v1/admin/ads	Lists all ads.	200 OK. data array where each ad includes id, title, status, type, location, start/end dates, target_url, ctr, clicks_count, impressions_count, and nested company info
{
    "data": [
        {
            "id": 1,
            "title": "deserunt",
            "status": "active",
            "type": "slideshow",
            "location": "header",
            "starts_at": "2025-08-19T16:57:48.000000Z",
            "ends_at": "2025-08-23T16:57:48.000000Z",
            "target_url": "http://www.kihn.com/magni-consequatur-commodi-est-itaque-harum.html",
            "created_at": "2025-08-19T16:57:48.000000Z",
            "updated_at": "2025-08-19T16:57:48.000000Z",
            "ctr": 0,
            "clicks_count": null,
            "impressions_count": null,
            "company": {
                "id": 5,
                "name": "Dr. Burley Boehm",
                "description": "Quae eligendi nulla quidem iste. Maiores quae qui dolorum sequi officia ullam. Fugiat sapiente ut minus vitae.",
                "founded_year": 2020,
                "is_active": true,
                "verified_at": "2025-08-19T16:57:44.000000Z",
                "location": "Guernsey",
                "logo": "https://test.hgallerycandles.com/storage/615/2.png"
            }
        },
        .
GET /api/v1/admin/ads/{id}	Path id=1.	The default id was 151; editing the path to 1 still returned 404 Record not found
app.apidog.com
. (It appears only certain ad IDs exist; 151 may be valid in the dataset.)
POST /api/v1/admin/ads	form-data: title, type ("banner" or "slideshow"), location ("header" or "footer"), starts_at, ends_at, target_url, and media[] file.	201 Created. Response: message and ad object with id, title, initial status "pending", type, location, dates, target URL, company info, and media list (id, type, url, is_main)
app.apidog.com
.
PUT /api/v1/admin/ads/{id}	JSON body can update title, status (pending, active, inactive, finished), type, location, starts_at, ends_at, target_url
{
    "data": {
        "id": 5,
        "title": "autem",
        "status": "active",
        "type": "banner",
        "location": "header",
        "starts_at": "2025-08-19T16:57:48.000000Z",
        "ends_at": "2025-09-06T16:57:48.000000Z",
        "target_url": "http://flatley.com/",
        "created_at": "2025-08-19T16:57:48.000000Z",
        "updated_at": "2025-08-19T16:57:48.000000Z",
        "ctr": 0,
        "clicks_count": null,
        "impressions_count": null,
        "company": {
            "id": 5,
            "name": "Dr. Burley Boehm",
            "description": "Quae eligendi nulla quidem iste. Maiores quae qui dolorum sequi officia ullam. Fugiat sapiente ut minus vitae.",
            "founded_year": 2020,
            "is_active": true,
            "verified_at": "2025-08-19T16:57:44.000000Z",
            "location": "Guernsey",
            "logo": "https://test.hgallerycandles.com/storage/615/2.png"
        },
        "media": [
            {
                "id": 638,
                "name": "banner-ad2",
                "url": "https://test.hgallerycandles.com/storage/638/banner-ad2.png",
                "type": "image/png"
            },
            {
                "id": 639,
                "name": "banner-ad",
                "url": "https://test.hgallerycandles.com/storage/639/banner-ad.jpg",
                "type": "image/jpeg"
            },
            {
                "id": 640,
                "name": "banner-ad",
                "url": "https://test.hgallerycandles.com/storage/640/banner-ad.jpg",
                "type": "image/jpeg"
            }
        ]
    }
}.	200 OK. Response returns message and updated ad object
app.apidog.com
.
POST /api/v1/admin/ads/{id}/media	form-data media[] file; adds extra images.	200 OK. Returns message "Media added successfully"
app.apidog.com
.
DELETE /api/v1/admin/ads/{id}/media/{mediaId}	Path ad id and mediaId.	200 OK. Response: "Media deleted successfully"
app.apidog.com
.
DELETE /api/v1/admin/ads/{id}	Deletes an ad.	200 OK. Response: "Ad deleted successfully"
app.apidog.com
.
Product management
Products
Endpoint	Request details	Response observed
GET /api/v1/admin/products	No parameters.	Response schema undefined; the API likely returns products array but the UI shows no defined fields
{
    "data": [
        {
            "id": 1,
            "name": "Sports Sunglasses",
            "image": "https://test.hgallerycandles.com/storage/742/post4.png",
            "description": "Sapiente vitae qui consequatur sit qui sequi. Eligendi a fuga qui perspiciatis iste. Ducimus quibusdam libero nam praesentium.",
            "moq": 54,
            "rating": 3.33,
            "price_type": "sku",
            "is_active": true,
            "unit": "pcs",
            "created_at": "2025-08-19T16:57:48.000000Z",
            "updated_at": "2025-08-19T16:57:48.000000Z",
            "inventory": 80399642,
            "is_rts": true,
            "shown_price": "675.00",
            "reviews_count": 3,
            "skus_count": 3,
            "category": {
                "id": 351,
                "name": "Bags & Accessories",
                "image": "https://test.hgallerycandles.com/storage/344/category4.png"
            },
            "supplier": {
                "id": 1,
                "name": "Magnus Wilderman",
                "location": "Burkina Faso",
                "logo": "https://test.hgallerycandles.com/storage/611/2.png",
                "on_time_delivery_rate": "44.60",
                "rating": "4.17"
            }
        },.
GET /api/v1/admin/products/{id}	Path id.	Response undefined
{
    "data": {
        "id": 10,
        "name": "Smart Fitness Watch",
        "image": "https://test.hgallerycandles.com/storage/792/post6.png",
        "description": "Aliquid quam voluptas est vel non consequatur accusantium. Pariatur et impedit fuga optio praesentium rerum. Laboriosam qui praesentium qui iste harum dolor aliquam.",
        "moq": 31,
        "rating": 4,
        "price_type": "tiered",
        "is_active": true,
        "unit": "oz",
        "created_at": "2025-08-19T16:57:48.000000Z",
        "updated_at": "2025-08-19T16:57:48.000000Z",
        "inventory": 258212183,
        "is_rts": true,
        "shown_price": "2555.00",
        "reviews_count": 2,
        "skus_count": 3,
        "category": {
            "id": 351,
            "name": "Bags & Accessories",
            "image": "https://test.hgallerycandles.com/storage/344/category4.png"
        },
        "rangePrices": null,
        "skus": [
            {
                "id": 28,
                "code": "SKU-897wj",
                "price": "503.00",
                "inventory": 74143,
                "attributes": [
                    {
                        "type": "select",
                        "hexColor": null,
                        "name": "Wilmer Goldner PhD",
                        "value": "odio"
                    },
                    {
                        "type": "select",
                        "hexColor": null,
                        "name": "Mrs. Jade Grady V",
                        "value": "nemo"
                    },
                    {
                        "type": "image",
                        "hexColor": null,
                        "name": "Wilmer Goldner PhD",
                        "value": "repellat"
                    }
                ]
            },
            {
                "id": 29,
                "code": "SKU-609yg",
                "price": "513.00",
                "inventory": 258137166,
                "attributes": [
                    {
                        "type": "select",
                        "hexColor": null,
                        "name": "Mrs. Jade Grady V",
                        "value": "et"
                    },
                    {
                        "type": "select",
                        "hexColor": null,
                        "name": "Wilmer Goldner PhD",
                        "value": "odio"
                    },
                    {
                        "type": "image",
                        "hexColor": null,
                        "name": "Ari Buckridge",
                        "value": "sint"
                    }
                ]
            },
            {
                "id": 30,
                "code": "SKU-926wt",
                "price": "976.00",
                "inventory": 874,
                "attributes": [
                    {
                        "type": "image",
                        "hexColor": null,
                        "name": "Ari Buckridge",
                        "value": "blanditiis"
                    },
                    {
                        "type": "color",
                        "hexColor": "#9f1171",
                        "name": "Ari Buckridge",
                        "value": "fugiat"
                    },
                    {
                        "type": "color",
                        "hexColor": "#0385c2",
                        "name": "Wilmer Goldner PhD",
                        "value": "ea"
                    }
                ]
            }
        ],
        "supplier": {
            "id": 1,
            "name": "Magnus Wilderman",
            "location": "Burkina Faso",
            "logo": "https://test.hgallerycandles.com/storage/611/2.png",
            "on_time_delivery_rate": "44.60",
            "rating": "4.17"
        },
        "tieredPrices": [
            {
                "minQuantity": 271,
                "price": "2555.00"
            },
            {
                "minQuantity": 915,
                "price": "89341.00"
            },
            {
                "minQuantity": 223,
                "price": "25842.00"
            }
        ],
        "media": [
            {
                "id": 792,
                "name": "post6",
                "url": "https://test.hgallerycandles.com/storage/792/post6.png",
                "type": "image/avif"
            },
            {
                "id": 793,
                "name": "post5",
                "url": "https://test.hgallerycandles.com/storage/793/post5.png",
                "type": "image/avif"
            }
        ]
    }
}.
PUT /api/v1/admin/products/{id}	Body contains product object with fields such as name, description, moq, product_unit_id, price_type, is_active, category_id
app.apidog.com
.	Response: {"message":"Product deleted successfully"} even when updating (likely mis-documented)
app.apidog.com
.
DELETE /api/v1/admin/products/{id}	Deletes a product.	200 OK. Returns {"message":"Product deleted successfully"}
app.apidog.com
.
Units
Endpoint	Request details	Response observed
GET /api/v1/admin/units	Lists units.	200 OK. Returns an array of units with id and name (e.g., box, L, pcs)
app.apidog.com
.
GET /api/v1/admin/units/{id}	Path id.	200 OK. Returns unit (id, name)
app.apidog.com
.
POST /api/v1/admin/units	Body: { "name":"Kilogram" }.	201 Created. Returns unit id and name
app.apidog.com
.
PUT /api/v1/admin/units/{id}	Body: { "name":"Kilogram" }.	200 OK. Returns updated unit id and name
app.apidog.com
.
DELETE /api/v1/admin/units/{id}	Deletes unit.	200 OK. Returns {"message":"Unit deleted successfully"}
app.apidog.com
.
Variations
Endpoint	Request details	Response observed
GET /api/v1/admin/variations	No parameters.	200 OK. Returns an array of variations with id and name
app.apidog.com
.
GET /api/v1/admin/variations/{id}	Path id.	200 OK. Returns variation with id and name
app.apidog.com
.
POST /api/v1/admin/variations	Docs show POST /units but body is { "name":"Size" } (assumed create variation).	201 Created. Response returns id and name
app.apidog.com
.
PUT /api/v1/admin/variations/{id}	Body: { "name":"Size" }.	200 OK. Returns updated variation id and name
app.apidog.com
.
DELETE /api/v1/admin/variations/{id}	Deletes variation.	200 OK. Returns {"message":"Product variation deleted successfully"}
app.apidog.com
.
Variation Values
Endpoint	Request details	Response observed
GET /api/v1/admin/variations/{variationId}/values	Lists values for a variation.	200 OK. Returns array of values each with id and value
app.apidog.com
.
GET /api/v1/admin/variations/{variationId}/values/{id}	Path parameters variationId and value id.	200 OK. Returns object with id and value
app.apidog.com
.
POST /api/v1/admin/variations/{variationId}/values	Body: { "value":"RED" }.	201 Created. Response returns new id and value
app.apidog.com
.
PUT /api/v1/admin/variations/{variationId}/values/{id}	Body: { "value":"BLACK" }.	200 OK. Returns updated id and value
app.apidog.com
.
DELETE /api/v1/admin/variations/{variationId}/values/{id}	Deletes variation value.	200 OK. Returns {"message":"Product variation value deleted successfully."}
app.apidog.com
.
Categories
Endpoint	Request details	Response observed
GET /api/v1/admin/categories	No parameters.	200 OK. Returns data array of categories; each includes id, name, is_featured, parent object, image, and timestamps
app.apidog.com
.
GET /api/v1/admin/categories/{id}	Path id.	200 OK. Returns data object; example mirrored list categories (same fields)
app.apidog.com
.
POST /api/v1/admin/categories	Body: { "name":"Electronics", "featured":true, "parent_id": null, "image": (file) }.	201 Created. Returns message and data with category details including is_featured, parent, image, timestamps
app.apidog.com
.
PUT /api/v1/admin/categories/{id}	Body similar to create.	200 OK. Returns message and updated category details
app.apidog.com
.
DELETE /api/v1/admin/categories/{id}	Deletes category.	200 OK. Response: "Category deleted successfully"
app.apidog.com
.
Orders
Endpoint	Request details	Response observed
GET /api/v1/admin/orders	No parameters.	Response schema undefined; no fields shown
app.apidog.com
.
GET /api/v1/admin/orders/{id}	Path id.	Response undefined
app.apidog.com
.
DELETE /api/v1/admin/orders/{id}	Deletes an order.	200 OK. Response: "Order deleted successfully."
app.apidog.com
.
Communication
Endpoint	Request details	Response observed
GET /api/v1/admin/communication	Lists messages/notifications.	Response undefined (no schema)
app.apidog.com
.
POST /api/v1/admin/communication	Sends a message; no body fields specified.	Response undefined (no sample)
app.apidog.com
.
Company (Vendor) authentication & RFQ
Endpoint	Request details	Response observed
POST /api/v1/company/login	JSON body with email and password.	Response undefined (likely returns token)
app.apidog.com
.
GET /api/v1/company/quotes	Lists vendor’s quotes.	200 OK. Returns data array with each quote’s id, message, currency, lead_time_days, status, submitted_at, due_at, and nested vendor company details
app.apidog.com
.
POST /api/v1/company/quotes	Form-data: rfq_id, message, currency, lead_time_days, optional attachments[].	201 Created. Returns message and quote details including attachments and vendor info
app.apidog.com
.
GET /api/v1/company/quotes/{id}	Path id.	200 OK. Returns quote data (id, message, currency, lead_time_days, status, vendor company name, attachments)
app.apidog.com
.
DELETE /api/v1/company/quotes/{id}	Withdraws a quote.	200 OK. Response: "Quote withdrawn successfully."
app.apidog.com
.
GET /api/v1/company/rfq-market	Lists open RFQs.	200 OK. Returns data array of RFQs with id, title, description, status, timestamps, plus pagination
app.apidog.com
.
GET /api/v1/company/rfq-market/{rfqId}	Shows RFQ details.	Response undefined
app.apidog.com
.