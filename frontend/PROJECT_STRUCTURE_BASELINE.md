# FLOXA Pre-Migration Structure

Recorded before the Next.js frontend cleanup and Django API preparation.

```text
floxa-project/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── public/
│   └── assets/                         (empty in supplied project)
├── src/
│   ├── app/
│   │   ├── api/                        (legacy Next.js backend routes)
│   │   ├── auth/login/page.tsx
│   │   ├── client/[token]/page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── portfolio/page.tsx
│   │   │   ├── projects/page.tsx
│   │   │   ├── projects/[id]/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── client/
│   │   ├── dashboard/
│   │   └── layout/
│   ├── hooks/useProjects.ts
│   ├── lib/                            (legacy backend integrations plus Brand DNA logic)
│   ├── middleware.ts
│   ├── styles/globals.css
│   └── types/index.ts
├── .env.example
├── .gitignore
├── DEVELOPER_NOTES.md
├── next.config.js
├── package.json
├── README.md
├── setup.sh
└── tsconfig.json
```

Baseline observations:

- No Git repository existed in the supplied folder.
- No package lockfile or `node_modules` directory existed.
- `public/assets` was empty although the UI references a logo and favicon.
- The legacy backend used Next.js route handlers, Prisma, Firebase, NextAuth,
  payment, email, upload, WhatsApp, and optional AI integrations.
- The migration target is a frontend-only Next.js application consuming
  Django REST Framework endpoints under `/api/v1`.
