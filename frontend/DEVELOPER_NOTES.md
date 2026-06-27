# FLOXA Frontend Developer Notes

## Architecture

The repository is frontend-only. Do not add database access, payment secrets,
email credentials, or provider admin SDKs to this Next.js project.

All application data must flow through the service modules in `src/services`.
The API base URL is configured in `src/config/api.js`.

## Authentication

The frontend expects these Django REST Framework endpoints:

```text
POST /api/v1/auth/login/
GET  /api/v1/auth/me/
POST /api/v1/auth/token/refresh/
POST /api/v1/auth/logout/
```

The client accepts common Simple JWT response names (`access`, `refresh`) and
also tolerates `access_token` and `refresh_token`.

The current compatibility implementation stores returned JWTs in browser
storage. For production, prefer a short-lived access token in memory and a
Secure, HttpOnly refresh-token cookie issued by Django.

## API services

- `authService.js`: consultant authentication
- `projectService.js`: dashboard project operations
- `clientPortalService.js`: public-link exchange and portal operations
- `discoveryService.js`: consultant discovery/Brand DNA operations
- `paymentService.js`: payment endpoint placeholder
- `uploadService.js`: Django-managed upload endpoint
- `notificationService.js`: notification endpoint placeholder

## Client portal

The URL token is sent to `/client-portal/session/`. Django should exchange it
for a short-lived, project-scoped portal token. The frontend sends that token
using `X-Client-Portal-Token`.

## Reference schema

`docs/reference/prisma-schema.prisma` documents the former data model. It is
not executable production code and must not be added back to package scripts.
