# API conventions

Base URL: `/api/v1`. Interactive reference: Swagger UI at `/docs` (non-production).

## Envelope

```json
{ "success": true, "data": { ... }, "meta": { } }
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "…", "details": [...], "requestId": "…" } }
```

Error codes are defined in `packages/shared-types/src/api.ts` (`ApiErrorCode`). Clients switch on `code`.

## Authentication

- `Authorization: Bearer <accessToken>` (15 min TTL by default).
- `POST /auth/refresh` rotates the refresh token (30 days). Reuse of a rotated token revokes the whole token family.
- Every route is protected unless decorated `@Public()`.
- Fine-grained access is permission based: `@RequirePermissions('members:read')`. Gym routes additionally require tenant membership (`GymTenantGuard`).

## Pagination, filtering, sorting

List endpoints accept `page` (1-based), `pageSize` (≤100), `sort`, `order=asc|desc` plus endpoint-specific filters, and return:

```json
{ "items": [...], "total": 120, "page": 1, "pageSize": 20, "hasMore": true }
```

## Idempotency

Financial POSTs (`/memberships`, `/admin/gyms/:id/payments`, `/admin/gyms/:id/subscriptions`) accept an `Idempotency-Key` header. Replays return the original response.

## Localisation

`Accept-Language: so|en` selects translated catalogue names where available (`nameSo`). Validation messages are machine-readable keys so clients render them in the user's language.

## Rate limits

Global 120 requests/minute per IP; `auth/*` endpoints are tighter (10/min); AI chat and scans have per-user daily quotas (`AI_DAILY_MESSAGE_LIMIT`, `AI_DAILY_SCAN_LIMIT`).

## Module map

See `docs/architecture/overview.md`. Endpoint groups are documented per phase in `docs/phases/`.
