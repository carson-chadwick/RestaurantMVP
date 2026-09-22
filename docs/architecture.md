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

Do not create unnecessary abstraction layers.

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

The primary roles are:

* Customer
* Restaurant
* Restaurant employee

Never rely solely on hiding UI elements to enforce permissions.

Customer reputation information must not be publicly accessible.

---

## Application Logic

Keep business rules separate from presentation code when practical.

UI components should primarily handle presentation and user interaction.

Important business rules such as:

* Rating eligibility
* Customer participation
* Rating calculations
* Restaurant employee permissions

should be enforced in trusted server/database logic rather than only in the browser.

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

---

## Testing

Testing should focus on important product behavior rather than maximizing test count.

Prioritize tests for:

* Authentication
* Authorization
* Rating creation
* Rating calculations
* Customer opt-in/opt-out
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
