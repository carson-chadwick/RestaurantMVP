# Architecture

## Overview

This project is a full-stack web application built with a simple architecture appropriate for an MVP.

The application uses:

* **Next.js** — full-stack application framework
* **TypeScript** — application language
* **React** — user interface
* **Tailwind CSS** — styling
* **shadcn/ui** — reusable UI components
* **Supabase** — PostgreSQL database, authentication, and storage
* **Vercel** — application hosting
* **GitHub** — source control

Keep the architecture simple. Do not introduce additional services or infrastructure unless there is a demonstrated need.

---

## High-Level Architecture

```text
Browser
   │
   ▼
Next.js Application
   │
   ├── React UI
   ├── Server-side logic
   ├── Authentication checks
   └── Data access
          │
          ▼
       Supabase
       ├── PostgreSQL
       ├── Authentication
       └── Storage
```

The Next.js application is deployed through Vercel.

---

## Application Structure

Use a single Next.js application.

```text
src/
├── app/          # Routes, pages, layouts, and server endpoints
├── components/   # Shared UI components
├── features/     # Feature-specific application logic
├── lib/          # Shared services and utilities
└── types/        # Shared TypeScript types
```

Prefer organizing complex functionality by feature rather than creating large global folders.

Example:

```text
features/
├── auth/
├── restaurants/
├── customers/
└── ratings/
```

Apply these placement rules as features are implemented:

* `app/` defines routes, layouts, route handlers, and route-level composition. Keep reusable business rules out of route files.
* `features/<feature>/` owns feature-specific components, server actions, validation, data access, and tests.
* `components/` contains reusable, feature-neutral presentation components. Keep feature-specific UI with its feature.
* `lib/` contains shared infrastructure and integrations, such as the Supabase clients and environment configuration.
* `types/` contains generated database types and types genuinely shared by multiple features. Keep feature-local types with their feature.
* Keep tests beside the code they cover and use the `@/` alias for imports rooted at `src/`.

Create feature directories only when their implementation begins. Do not add placeholder files, speculative service or repository layers, broad barrel exports, or generic utility folders. Initialize shadcn/ui when the first shared UI components require it rather than generating unused files in advance.

---

## Database

Use **PostgreSQL through Supabase** as the single primary database.

Database changes must be managed through version-controlled migrations.

```text
supabase/
└── migrations/
```

Do not rely on manually created production database structures that are not represented in source control.

The detailed data model belongs in `docs/database-schema.md`.

---

## Authentication

Use **Supabase Auth**.

Supabase handles:

* Account authentication
* Password management
* Sessions
* Authentication tokens

Application-specific user information should be stored in application tables linked to the Supabase authenticated user ID.

Do not implement a custom authentication system.

---

## Authorization

Authorization must be enforced server-side and, where appropriate, through Supabase Row Level Security (RLS).

The mutually exclusive MVP account roles are:

* Customer
* Restaurant
* Restaurant employee

Never rely solely on hiding UI elements to enforce permissions.

Customer reputation information must not be publicly accessible.

Restaurant creation is self-service and email confirmation is deferred for the MVP. One owner account creates and manages one restaurant. Employees create dedicated accounts before an owner grants immediate access by exact email; each employee may belong to one restaurant, and the owner may revoke that membership. Every staff action must resolve ownership or active membership for the target restaurant. Customer identity, visit, and rating access must be checked in trusted server logic and backed by RLS where appropriate. Public restaurant rating aggregates must not expose customer identities.

Protected route layouts use a shared server-side account guard that verifies the Supabase user and resolves the trusted role from `account_roles`. Unauthenticated users go to login; authenticated users who open another role's portal are redirected to their canonical portal without losing their session. Server actions repeat the required role check near each mutation, and RLS, trusted database functions, column grants, and constraints remain the final authorization boundary.

Phase 2 basic profiles allow users to update their own first and last name. Restaurant owners may also update their own restaurant's name. Emails and account roles are read-only, employees cannot edit restaurant data, and public listing details are deferred to Phase 3.

Phase 3 restaurant profiles add optional address, phone, description, and structured weekly hours. Restaurant-specific validation, actions, types, and UI live in `features/restaurants`; the generic profiles feature remains responsible only for personal customer and staff information. Owners may update listing fields, employees have read-only access through their restaurant membership, and public database access remains deferred until discovery routes are implemented. Rating summaries use an average/count contract with an empty state until restaurant ratings are added.

Public restaurant discovery uses narrowly scoped, read-only PostgreSQL functions callable by anonymous and authenticated users. These functions return only safe listing fields and rating aggregates, never ownership, staff, or account data. `/restaurants` provides server-rendered name search and pagination, while `/restaurants/[restaurantId]` provides the public profile. Phase 3 returns a null average and zero count; Phase 4 will preserve the function and TypeScript contracts while deriving live values from restaurant ratings.

---

## Application Logic

Keep business rules separate from presentation code when practical.

UI components should primarily handle presentation and user interaction.

Important business rules such as:

* Rating eligibility
* Customer identity privacy
* Rating calculations
* Restaurant employee permissions

should be enforced in trusted server/database logic rather than only in the browser.

### MVP visit and rating flow

1. Authenticated restaurant staff browse recent acknowledged customers or search an exact first and last name, then record a paid visit in their restaurant. The protected workflow shows customer email addresses. The record represents payment made outside Dining Plus; no payment or booking integration is involved.
2. The customer sees the pending visit on their next in-app visit and may submit one restaurant rating. It contributes immediately to the public restaurant average and count. There is no separate staff confirmation.
3. Customer signup acknowledgement authorizes the protected identity-sharing and two-sided-rating workflow for the MVP.
4. Authorized staff may rate the customer once for that visit only after the customer has rated the restaurant. Customer aggregates and counts are exposed only to the customer and authorized staff inside the visit workflow. Individual received ratings are visible only to that customer and omit the submitting staff identity.

Server-side operations validate visit-to-restaurant/customer relationships, staff membership, signup acknowledgement, and 1–5 star values before writes. Customer browsing, exact-name search, and Auth email access are limited to authenticated staff with an active restaurant relationship. Database uniqueness and check constraints provide a second integrity boundary. Details of the entities and constraints are in `docs/database-schema.md`.

---

## Data Validation

Validate external/user input before it reaches business logic or the database.

Use **Zod** for application-level validation where appropriate.

Database constraints should also enforce important data integrity rules.

---

## Deployment

Development workflow:

```text
Local Development
       │
       ▼
     GitHub
       │
       ▼
     Vercel
       │
       ▼
 Next.js Application
       │
       ▼
    Supabase
```

Environment-specific secrets and credentials must be stored in environment variables and never committed to source control.

For the initial MVP, Vercel deploys only the `main` branch to `https://dining-plus.vercel.app`. Preview deployments are disabled. Local development and production temporarily use the same hosted Supabase project to minimize infrastructure; this means development operations can affect production data. Migrations must be reviewed before application, linked resets are prohibited once real data exists, and production must move to a separate Supabase project before the shared environment becomes unsafe.

---

## Testing

Testing should focus on important product behavior rather than maximizing test count.

Prioritize tests for:

* Authentication
* Authorization
* Rating creation
* Rating calculations
* Privacy boundaries

Use lightweight unit/integration testing during development and end-to-end testing for critical user flows.

---

## Architecture Principles

1. Keep the application as a **single deployable application**.
2. Use **one primary PostgreSQL database**.
3. Prefer built-in Next.js and Supabase capabilities before adding services.
4. Do not introduce microservices, queues, caching layers, or additional infrastructure without a demonstrated need.
5. Keep business logic out of presentation components when practical.
6. Enforce security and authorization on trusted server/database boundaries.
7. Keep database changes version-controlled.
8. Optimize for simplicity, maintainability, and fast iteration.
9. Architecture may evolve when real usage demonstrates a need—not in anticipation of hypothetical scale.
