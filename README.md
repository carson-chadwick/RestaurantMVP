# Dining Plus

Dining Plus is a two-sided restaurant reputation platform. This repository
contains the single Next.js application described in the project architecture.

The application is currently in Phase 1 (Foundation). The web scaffold,
development quality gates, hosted Supabase connection, authentication
foundation, and database migration workflow are configured. Deployment
is configured and verified on Vercel.

## Prerequisites

- Node.js 22
- npm 10 or newer

If you use a Node version manager that supports `.nvmrc`, run `nvm use` from the
repository root.

## Local development

Install the exact dependency tree recorded in `package-lock.json`:

```bash
npm ci
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verification

Run the complete local CI pipeline before submitting substantive changes:

```bash
npm run ci
```

This checks formatting, lint rules, TypeScript types, unit tests, the production
build, and production dependency vulnerabilities. Individual checks are also
available through the scripts in `package.json`.

## Environment variables

Local `.env*` files are ignored so credentials cannot be committed accidentally.
Create your local file from the committed example:

```bash
Copy-Item .env.example .env.local
```

From the Supabase Dashboard, open the development project's **Connect** panel and
replace both placeholders in `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

These two values are designed for browser use and depend on Row Level Security
for authorization. Never put a service-role key, database password, or Supabase
access token in `.env.local` or any `NEXT_PUBLIC_` variable.

## Supabase project setup

The application uses an existing hosted development project directly. A local
Docker-based Supabase stack is not part of this workflow.

Authenticate the pinned project CLI:

```bash
npx supabase login
```

Complete the browser prompt, then copy the project reference from a Dashboard URL
such as `https://supabase.com/dashboard/project/<project-ref>`. Link the checkout:

```bash
npx supabase link --project-ref <project-ref>
```

Enter the database password only in the CLI prompt. The CLI keeps login and link
state outside tracked source files. Use `npx supabase projects list` to confirm
the linked project before running any database command.

Do not create tables manually in the Dashboard. Schema changes are managed as
version-controlled SQL migrations. After a migration is applied, regenerate
application database types with:

```bash
npm run db:types
```

## Database migrations

Migration files live in `supabase/migrations/`. Add the first real migration
when a product feature needs database objects; the repository intentionally has
no empty baseline migration.

Create a migration with a short snake-case name:

```bash
npm run db:migration:new -- create_customer_profiles
```

Write all related tables, constraints, indexes, grants, functions, and Row Level
Security policies in the generated SQL file. Do not edit a migration after it
has been applied to a shared project. Add a new corrective migration instead.

Before applying changes, confirm the local and hosted migration histories, lint
the hosted schema, and preview exactly what will run:

```bash
npm run db:migrations
npm run db:lint
npm run db:push:dry-run
```

Review the SQL and dry-run output before applying it to the linked development
project:

```bash
npm run db:push
npm run db:types
```

Commit the migration and regenerated types together. This hosted-only workflow
does not use Docker, automatic seed data, or remote database resets. Never run a
linked reset or repair migration history unless the recovery operation has been
explicitly reviewed.

## Authentication foundation

Authentication uses Supabase's email-and-password provider with cookie-based
server-side rendering. Browser code imports `createClient` from
`src/lib/supabase/client.ts`; Server Components, Server Actions, and Route
Handlers use the async `createClient` from `src/lib/supabase/server.ts`.

The root Next.js Proxy refreshes expired authentication tokens and validates
identity claims before passing requests to the application. It does not grant
roles, protect routes, or replace authorization checks near sensitive data.
Those behaviors are implemented with the account and role features in Phase 2.

For the hosted Supabase project, use these Auth settings:

- **Authentication → Providers → Email**: enable Email and email signup, and
  retain the default password policy.
- **Authentication → URL Configuration**: before production deployment, use
  `http://localhost:3000` as the Site URL and allow
  `http://localhost:3000/**` as a redirect URL. After deployment, replace the
  Site URL with the exact production `https://<project>.vercel.app` URL while
  retaining the localhost redirect URL.
- Leave phone, social providers, anonymous sign-ins, and manual account linking
  disabled.

The hosted project is configured to auto-confirm new email signups, so users do
not need to follow an email confirmation link for the MVP. The current Dashboard
may not expose this control; compare the linked project with `npx supabase config
diff` rather than broadly pushing the generated local configuration.

Preview deployments are disabled, so do not add a broad Vercel wildcard to the
redirect allowlist. Do not add a service-role key to the application
environment.

## Production deployment

Dining Plus deploys to Vercel from the GitHub repository. The `main` branch is
the only branch permitted to trigger a deployment; branch preview deployments
are intentionally disabled in `vercel.json`.

Production URL: [https://dining-plus.vercel.app](https://dining-plus.vercel.app)

Import `carson-chadwick/RestaurantMVP` in Vercel with these settings:

- Project name: `dining-plus`, if available.
- Framework preset: Next.js.
- Root directory: repository root.
- Production branch: `main`.
- Node.js version: 22.x.
- Install, build, and output settings: Vercel defaults.

In the Vercel project's **Production** environment only, add the two values from
the Supabase Dashboard's Connect/API panel:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Do not add a service-role key, database password, or CLI token. Deploy the
project, then set Supabase Auth's Site URL to the exact generated production URL
as described above. Verify that the root page returns HTTP 200, displays Dining
Plus, and produces no build or runtime errors in Vercel.

Every future push to `main` deploys directly to production. Run `npm run ci`
before pushing. To recover from a bad release, use Vercel's deployment history
to roll back to the last verified production deployment, then fix the source on
`main`; do not patch generated deployment files.

Local development and production currently share one Supabase project. Once
real users exist, local operations can affect production data: apply only
reviewed migrations, do not run linked database resets, and avoid creating or
deleting test data that could be mistaken for real data. Move production to a
separate Supabase project before this shared setup becomes unsafe.

The committed `supabase/config.toml` remains localhost-oriented for CLI tooling
and intentionally differs from the hosted Auth URL settings. Do not broadly run
`supabase config push` against the shared project; review and apply any future
hosted configuration change narrowly.

## Project structure

```text
src/
├── app/          # Routes, layouts, and global styles
├── components/   # Shared UI components
├── features/     # Feature-specific application logic
├── lib/          # Shared services and utilities
└── types/        # Shared TypeScript types
```

See `ROADMAP.md` for delivery status and `docs/architecture.md` for system design.
