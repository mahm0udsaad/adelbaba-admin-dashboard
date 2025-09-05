Admin API Integration Guide (Markdown)

Base URL: https://test.hgallerycandles.com/api/v1/admin
Auth: Bearer token (returned from POST /login)
Headers (default):

Accept: application/json

Content-Type: application/json (use multipart/form-data for uploads)

This guide explains how to integrate each endpoint into the dashboard UI, how to call it, and what to expect. It’s based on the project structure you showed in Apidog and the UI we built (tables with search & filters in the navbar).

0) Auth
Login

POST /login

Body (JSON)

{ "email": "admin@example.com", "password": "••••••••" }


Response (shape)

{
  "message": "User authenticated successfully",
  "user": { "id": 1, "name": "Admin", "email": "admin@example.com" },
  "roles": [/*...*/],
  "token": "117|OgZdQZmgUUFWPnxY..."
}


Frontend integration

On success, store token in localStorage as admin_token.

All subsequent requests must include Authorization: Bearer <token>.

Axios setup

import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://test.hgallerycandles.com/api/v1/admin',
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

1) Companies
List

GET /companies
Optional: ?page=1&search=Acme&region_id=...&state_id=...&city_id=...&is_active=true&is_verified=true

Use in UI

Populate companies table.

Bind navbar search to search.

Bind filters to region/state/city/is_active/is_verified.

export const listCompanies = (params?: any) => api.get('/companies', { params });

Show

GET /companies/{companyId}

Use in UI

Row click → open details drawer.

export const showCompany = (id: number|string) => api.get(`/companies/${id}`);

Create

POST /companies (multipart/form-data)

Notes

Create requires many fields: name, description, region/state/city IDs, contacts, owner info; optional documents/media.

export const createCompany = (form: FormData) =>
  api.post('/companies', form, { headers: { 'Content-Type': 'multipart/form-data' }});

Update

PATCH /companies/{companyId} (JSON)

Typical fields

is_active, is_verified, platforms (array), etc.

export const updateCompany = (id: number|string, body: any) =>
  api.patch(`/companies/${id}`, body);

Delete

DELETE /companies/{companyId}

export const deleteCompany = (id: number|string) =>
  api.delete(`/companies/${id}`);

2) Users
List

GET /users
Optional: ?page&search&role&company_id

export const listUsers = (params?: any) => api.get('/users', { params });

Show

GET /users/{id}

export const showUser = (id: number|string) => api.get(`/users/${id}`);

Create

POST /users

Body

name, email, phone, region_id, password, company_name

export const createUser = (body: any) => api.post('/users', body);

Update

PUT /users/{id}

export const updateUser = (id: number|string, body: any) =>
  api.put(`/users/${id}`, body);

Delete

DELETE /users/{id}

export const deleteUser = (id: number|string) => api.delete(`/users/${id}`);

3) Roles & Permissions
List roles

GET /roles

export const listRoles = () => api.get('/roles');

Show role

GET /roles/{roleId}

export const showRole = (id: number|string) => api.get(`/roles/${id}`);

Create role

POST /roles
Body: {"name":"Support","permissions":[1,3,4]}

export const createRole = (body: { name: string; permissions: number[] }) =>
  api.post('/roles', body);

Update role

PUT /roles/{roleId}

export const updateRole = (id: number|string, body: any) =>
  api.put(`/roles/${id}`, body);

Delete role

DELETE /roles/{roleId}

export const deleteRole = (id: number|string) => api.delete(`/roles/${id}`);

List permissions

GET /roles/permissions

export const listPermissions = () => api.get('/roles/permissions');


UI

Table of roles.

Clicking a role opens a modal with permission list.

Filters are optional.

4) Admins & Employees (Management)
List

GET /management?type=admin or type=employee

export const listMembers = (type: 'admin'|'employee', params?: any) =>
  api.get('/management', { params: { type, ...params }});

Show

GET /management/{id}

export const showMember = (id: number|string) => api.get(`/management/${id}`);

Create

POST /management
Body: name, email, phone, password, roles (ids), type (admin/employee), is_active

export const createMember = (body: any) => api.post('/management', body);

Update

PUT /management/{id}

export const updateMember = (id: number|string, body: any) =>
  api.put(`/management/${id}`, body);

Delete

DELETE /management/{id}

export const deleteMember = (id: number|string) =>
  api.delete(`/management/${id}`);


UI

Table with columns: Name, Email, Phone, Roles, Type, Active.

Filters: type, active.

5) Support Tickets
List (all)

GET /support-tickets
Optional: ?page&search&priority&category&status&assignee_id

export const listTickets = (params?: any) => api.get('/support-tickets', { params });

List (assigned to me)

GET /support-tickets/assigned

export const listAssignedTickets = (params?: any) =>
  api.get('/support-tickets/assigned', { params });

Show

GET /support-tickets/{ticketId}

export const showTicket = (id: number|string) => api.get(`/support-tickets/${id}`);

Reply

POST /support-tickets/{ticketId}/reply
Body: {"message":"..."}

For attachments: use multipart/form-data.

export const replyTicket = (id: number|string, body: any) =>
  api.post(`/support-tickets/${id}/reply`, body);

Update

PATCH /support-tickets/{ticketId}

Change status, priority, etc.

export const updateTicket = (id: number|string, body: any) =>
  api.patch(`/support-tickets/${id}`, body);

Assign / Reassign

PATCH /support-tickets/{ticketId}/assign
Body: {"assignee_id": 12}

export const assignTicket = (id: number|string, assignee_id: number) =>
  api.patch(`/support-tickets/${id}/assign`, { assignee_id });

Delete

DELETE /support-tickets/{ticketId}

export const deleteTicket = (id: number|string) =>
  api.delete(`/support-tickets/${id}`);


UI

Table columns: Ticket #, Subject, Priority, Category, Status, Assigned To, Created At.

Filters: Priority, Category, Status, Assignee.

Row click → drawer with full details and reply form.

6) Subscriptions – Plans
List

GET /subscriptions/plans

export const listPlans = () => api.get('/subscriptions/plans');

Show

GET /subscriptions/plans/{id}

export const showPlan = (id: number|string) => api.get(`/subscriptions/plans/${id}`);

Create

POST /subscriptions/plans
Body: {"name","payment_rate","price","support_level","features":[ids]}

export const createPlan = (body: any) => api.post('/subscriptions/plans', body);

Update

PUT /subscriptions/plans/{id}

export const updatePlan = (id: number|string, body: any) =>
  api.put(`/subscriptions/plans/${id}`, body);


UI

Table: Name, Payment Rate, Price, Support Level, Features Count.

Filters: Payment Rate, Support Level.

7) Subscriptions – Features
List

GET /subscriptions/features

export const listFeatures = () => api.get('/subscriptions/features');

Show

GET /subscriptions/features/{id}

export const showFeature = (id: number|string) =>
  api.get(`/subscriptions/features/${id}`);

Create

POST /subscriptions/features
Body: {"name":"Full Support 24/7"}

export const createFeature = (body: { name: string }) =>
  api.post('/subscriptions/features', body);

Update

PUT /subscriptions/features/{id}

export const updateFeature = (id: number|string, body: { name: string }) =>
  api.put(`/subscriptions/features/${id}`, body);

Delete

DELETE /subscriptions/features/{id}

export const deleteFeature = (id: number|string) =>
  api.delete(`/subscriptions/features/${id}`);


UI

Table: Feature Name.

Simple search by name.

8) Ads
List

GET /ads

export const listAds = (params?: any) => api.get('/ads', { params });

Show

GET /ads/{id}

export const showAd = (id: number|string) => api.get(`/ads/${id}`);

Create

POST /ads (multipart/form-data)
Fields: title, type (banner/slideshow), location (header/footer), starts_at, ends_at, target_url, media[] (files)

export const createAd = (form: FormData) =>
  api.post('/ads', form, { headers: { 'Content-Type': 'multipart/form-data' }});

Update

PUT /ads/{id} (JSON)
Fields: title, status (pending/active/inactive/finished), type, location, starts_at, ends_at, target_url

export const updateAd = (id: number|string, body: any) =>
  api.put(`/ads/${id}`, body);

Add Media

POST /ads/{id}/media (multipart/form-data)
Field: media[] files

export const addAdMedia = (id: number|string, form: FormData) =>
  api.post(`/ads/${id}/media`, form, { headers: { 'Content-Type': 'multipart/form-data' }});

Delete Media

DELETE /ads/{id}/media/{mediaId}

export const deleteAdMedia = (id: number|string, mediaId: number|string) =>
  api.delete(`/ads/${id}/media/${mediaId}`);

Delete Ad

DELETE /ads/{id}

export const deleteAd = (id: number|string) => api.delete(`/ads/${id}`);


UI

Table: Title, Status, Type, Location, Start/End, Target URL.

Filters: Status, Type, Location.

Row → media gallery drawer; add/remove media.

9) Products – Units
List

GET /units

export const listUnits = () => api.get('/units');

Show

GET /units/{id}

export const showUnit = (id: number|string) => api.get(`/units/${id}`);

Create

POST /units
Body: {"name":"Kilogram"}

export const createUnit = (body: { name: string }) => api.post('/units', body);

Update

PUT /units/{id}

export const updateUnit = (id: number|string, body: { name: string }) =>
  api.put(`/units/${id}`, body);

Delete

DELETE /units/{id}

export const deleteUnit = (id: number|string) => api.delete(`/units/${id}`);


UI

Table: Unit Name.

Simple search (client-side).

10) Products – Variations

Note: In the Apidog UI we saw a mislabel for Create Variation. The expected routes are below; confirm final paths with a quick test.

List

GET /variations

export const listVariations = () => api.get('/variations');

Show

GET /variations/{id}

export const showVariation = (id: number|string) => api.get(`/variations/${id}`);

Create

POST /variations
Body: {"name": "Color"}

export const createVariation = (body: { name: string }) =>
  api.post('/variations', body);

Update

PUT /variations/{id}

export const updateVariation = (id: number|string, body: { name: string }) =>
  api.put(`/variations/${id}`, body);

Delete

DELETE /variations/{id}

export const deleteVariation = (id: number|string) =>
  api.delete(`/variations/${id}`);

11) Products – Variation Values
List values for a variation

GET /variations/{variationId}/values

export const listVariationValues = (variationId: number|string) =>
  api.get(`/variations/${variationId}/values`);

Show value

GET /variations/{variationId}/values/{id}

export const showVariationValue = (variationId: number|string, id: number|string) =>
  api.get(`/variations/${variationId}/values/${id}`);

Create value

POST /variations/{variationId}/values
Body: {"value":"RED"}

export const createVariationValue = (variationId: number|string, body: { value: string }) =>
  api.post(`/variations/${variationId}/values`, body);

Update value

PUT /variations/{variationId}/values/{id}
Body: {"value":"BLACK"}

export const updateVariationValue = (
  variationId: number|string,
  id: number|string,
  body: { value: string }
) => api.put(`/variations/${variationId}/values/${id}`, body);

Delete value

DELETE /variations/{variationId}/values/{id}

export const deleteVariationValue = (variationId: number|string, id: number|string) =>
  api.delete(`/variations/${variationId}/values/${id}`);


UI

Page requires a selected Variation (e.g., “Color”) → then list values (e.g., “RED”, “BLUE”).

Simple search by value.

12) Products – Core (Overview)

The product payloads are more complex (media + nested variations). The pattern below matches what we saw.

List

GET /products
Optional filters: ?page&search&category_id&active&price_type

export const listProducts = (params?: any) => api.get('/products', { params });

Show

GET /products/{id}

export const showProduct = (id: number|string) => api.get(`/products/${id}`);

Create

POST /products
Body (JSON or multipart) includes:

name, description, moq, unit_id, price_type, category_id, is_active

media.add (files if multipart)

variations.add (array of variant objects with code, price, inventory, attributes like color/image)

export const createProduct = (body: any) => api.post('/products', body);

Update

PUT /products/{id}
Body supports:

media.add / media.remove

variations.add / variations.remove

Core fields (name/description/etc.)

export const updateProduct = (id: number|string, body: any) =>
  api.put(`/products/${id}`, body);

Delete

DELETE /products/{id}

export const deleteProduct = (id: number|string) => api.delete(`/products/${id}`);


UI

Table: Name, Short Description, MOQ, Unit, Price Type, Active, Category, Variants Count.

Filters: Category, Active, Price Type.

Drawer for editing media and variants.

Pagination, Search, Filters (General)

Prefer server-side params if supported:

?page=1

?search=...

Resource-specific filters (status, type, location, priority, etc.)

If an endpoint doesn’t support query params, fetch and filter client-side.

Error Handling

401: Missing/expired token → redirect to login.

403: Insufficient permissions → show “Not allowed”.

422: Validation errors → show form field errors.

500: Show generic error toast.

Global response interceptor (optional)

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

Client-Side Guard

Only run authed calls when a token exists and the app has hydrated:

'use client';
import { useEffect, useState } from 'react';
import { listCompanies } from '@/lib/api';

export default function CompaniesPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    listCompanies()
      .then(res => setRows(res?.data ?? res))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading…</div>;
  return /* render table */;
}

File Upload Pattern (Ads / Companies / Products)

FormData example

const form = new FormData();
form.append('title', 'Homepage Banner 1');
form.append('type', 'banner');
form.append('location', 'header');
form.append('starts_at', '2025-08-25 10:00:00');
form.append('ends_at', '2025-09-25 10:00:00');
form.append('target_url', 'https://example.com');
files.forEach(f => form.append('media[]', f));

await api.post('/ads', form, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

Final Notes

Keep the token key consistent: admin_token.

Ensure every request has Authorization: Bearer <token> and Accept: application/json.

For pages that combine data (e.g., Plans + Features), fetch features first to map IDs → names in the UI.

Confirm Variation Create path during integration (/variations) and adjust if your backend uses a different route.

