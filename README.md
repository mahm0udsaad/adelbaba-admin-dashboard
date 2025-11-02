# adelbaba-dashboard

## Environment Configuration

Create an `.env.local` file before running the dashboard and set the admin API base URL:

```
NEXT_PUBLIC_ADMIN_API_URL=https://api.adil-baba.com/api/v1/admin
# Optional: override for server-side fetchers if it differs from the public URL
ADMIN_API_URL=https://api.adil-baba.com/api/v1/admin
```

These values are consumed by the Axios client (`lib/api.ts`) and the server actions (`lib/server-actions.ts`).
