# Agent Instructions

## Required Context

Before planning or implementing work:

1. Read `ROADMAP.md` for project scope, sequencing, and current status.
2. Read `project-best-practices.md` and follow its engineering and security requirements.
3. Read `docs/architecture.md` for the current system architecture.
4. Read other files in `docs/` when relevant to the task.

Do not begin implementation without understanding the relevant project context.

## Source of Truth

Use each document for its intended purpose:

* `ROADMAP.md` — scope, phases, priorities, and progress.
* `project-best-practices.md` — engineering, security, and development standards.
* `docs/architecture.md` — system architecture and technology choices.
* `docs/product-requirements.md` — detailed product behavior and requirements.
* `docs/database-schema.md` — database entities, relationships, and constraints.
* `docs/decisions.md` — important decisions and their rationale.

Avoid duplicating the same information across multiple documents.

## Working Process

For non-trivial work:

1. Read the relevant project context.
2. Inspect the existing implementation, if any.
3. Identify ambiguities or missing requirements.
4. Ask questions rather than making significant product decisions without approval.
5. Create a plan before implementation.
6. Implement only the relevant roadmap scope.
7. Test and validate the work.
8. Update relevant documentation when decisions or implementation change.

## Project Rules

* Follow the roadmap unless explicitly instructed otherwise.
* Do not implement future features prematurely.
* Prefer simple solutions appropriate for the current stage.
* Do not introduce unnecessary abstractions or infrastructure.
* Follow all requirements in `project-best-practices.md`.
* Never weaken security, privacy, validation, or authorization for convenience.
* Keep documentation consistent with the implementation.

## Documentation Maintenance

Update documentation when appropriate:

* Roadmap progress → `ROADMAP.md`
* Product behavior → `docs/product-requirements.md`
* Architecture changes → `docs/architecture.md`
* Database changes → `docs/database-schema.md`
* Significant decisions → `docs/decisions.md`

Do not make unrelated documentation changes.
