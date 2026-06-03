# File Structure Reference

> **Audience:** Developers navigating the codebase and adding new features.

---

## Top-Level Directory Layout

```
stock-mgt/
├── .env.example              ← environment variable template (commit this)
├── .env.local                ← local overrides (git-ignored)
├── .gitignore
├── eslint.config.mjs
├── middleware.ts             ← Next.js middleware for auth protection
├── next.config.ts
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── tsconfig.json
├── tsconfig.tsbuildinfo
├── public/                   ← static assets (images, favicons, fonts)
├── src/                      ← **all application source code**
├── docs/                     ← documentation (this folder)
└── README.md
```

---

## `src/` Directory

```
src/
├── app/                      ← Next.js App Router pages + API routes
│   ├── api/                  ← backend endpoints
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── me/route.ts
│   │   │   └── change-password/route.ts
│   │   ├── users/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── categories/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── months/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── products/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── purchases/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   └── weekly-check/route.ts
│   ├── login/page.tsx        ← public login page
│   ├── layout.tsx            ← root HTML layout (fonts, Toaster)
│   ├── page.tsx              ← landing page (redirect or public content)
│   ├── stock/                ← stock management pages
│   │   ├── page.tsx          ← Dashboard (year/month overview)
│   │   ├── layout.tsx
│   │   ├── current/page.tsx  ← redirect to latest month
│   │   ├── compare/page.tsx  ← side-by-side month comparison
│   │   └── [year]/
│   │       ├── page.tsx      ← list months for a year
│   │       └── [monthId]/
│   │           ├── page.tsx  ← monthly stock table
│   │           └── check/page.tsx ← weekly usage entry
│   ├── categories/
│   │   ├── layout.tsx
│   │   └── page.tsx          ← category CRUD
│   ├── purchases/
│   │   ├── layout.tsx
│   │   └── page.tsx          ← purchase records list
│   ├── users/
│   │   ├── layout.tsx
│   │   └── page.tsx          ← user management
│   └── password/
│       ├── layout.tsx
│       └── page.tsx          ← change password form
├── components/               ← shared React components
│   ├── Sidebar.tsx
│   └── ConfirmModal.tsx
├── lib/                      ← shared server + client utilities
│   ├── db.ts                 ← MySQL connection pool
│   ├── types.ts              ← TypeScript interfaces (User, Category, …)
│   ├── schemas.ts            ← Zod validation schemas
│   ├── api.ts                ← frontend fetch wrappers + mappers
│   ├── auth-utils.ts         ← JWT helpers for server-side use
│   ├── stock-utils.ts        ← date math, editability checks
│   ├── stock-nav.ts          ← sidebar active-state helpers
│   ├── month-edit-server.ts  ← server-side month edit gate checks
│   ├── validate.ts           ← Zod body-validation helper for API routes
│   └── migrations/           ← SQL migration scripts
│       ├── 01-create-tables.sql
│       └── 02-seed-data.sql
├── data/
│   └── defaultProducts.ts    ← Product interface + sample fixture data
└── middleware.ts             ← (root-level symlink / same file)
```

---

## API Route Pattern

Every API route lives in `src/app/api/<resource>/route.ts` (collection) or `src/app/api/<resource>/[id]/route.ts` (single item).

**Collection route** (`GET`, `POST`):
- `GET` — returns all non-deleted records
- `POST` — creates a new record (validates body with Zod)

**Item route** (`PUT`, `DELETE`, optionally `GET`):
- `PUT` — updates the record
- `DELETE` — soft-deletes (sets `deleted_at = NOW()`), unless the table uses hard deletes (e.g. `purchases`, `month`)
- `GET` — not always implemented; add it if a single-item fetch is needed by the UI

All route files export named handler functions: `GET`, `POST`, `PUT`, `DELETE` matching the HTTP method.

**Dynamic route params:** In Next.js 16, dynamic `[id]` params are `Promise<{ id: string }` and must be awaited:
```typescript
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  // use Number(id) for DB queries
}
```

---

## Client-Side Fetching Pattern

Client components call the API through `src/lib/api.ts`. The central `fetchAPI` helper sets `credentials: 'include'` and parses JSON:

```typescript
async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  let data: unknown;
  try { data = await res.json(); }
  catch { throw new Error(`Request failed (${res.status})`); }
  if (!res.ok) throw new Error((data as Record<string, unknown>)?.error as string || 'Request failed');
  return data as T;
}
```

Each API function follows this shape:
```typescript
export async function getCategories() {
  return fetchAPI<Category[]>('/api/categories');
}

export async function createCategory(data: CreateCategoryPayload) {
  return fetchAPI<{ message: string }>('/api/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

---

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `secret` |
| `DB_NAME` | MySQL database name | `stock_mgt` |
| `JWT_SECRET` | Secret key for signing tokens | `random-64-char-string` |
| `NEXT_PUBLIC_APP_URL` | Public URL (optional) | `http://localhost:3000` |

`NEXT_PUBLIC_*` variables are exposed to the browser. All others are server-only.
