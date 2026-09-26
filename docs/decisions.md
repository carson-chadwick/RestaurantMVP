# Project Decisions

This file records significant product and technical decisions made during development.

For each significant decision, record:

* **Decision**
* **Date**
* **Context**
* **Rationale**
* **Alternatives considered**
* **Consequences**, when relevant

---

## 2026-09-30 — Private customer reputation and visit-based rating queue

* **Decision:** Active restaurant staff rate customers only from a paginated queue of existing visits for which the customer has already rated the restaurant. All authorized staff may see customer aggregates in the protected visit workflow. Individual restaurant-to-customer scores are visible only to the rated customer and identify the restaurant and visit date, not the submitting staff member.
* **Context:** Phase 5 completes the two-sided reputation flow while customer reputation remains sensitive.
* **Rationale:** A complete eligibility queue prevents older visits from becoming inaccessible, and aggregate-only staff access supports hospitality decisions without exposing cross-restaurant rating histories.
* **Alternatives considered:** Limiting eligibility to the 20 newest visits, searching for each eligible customer, showing individual values to the submitting restaurant, and exposing the submitting staff identity to customers.
* **Consequences:** Customer ratings are immutable, derived aggregates are private, and no public customer reputation interface exists.

## 2026-09-29 — Signup acknowledgement replaces MVP participation controls

* **Decision:** Customer signup requires one acknowledgement covering protected name/email sharing and eligibility for restaurant-to-customer ratings after an eligible restaurant rating. The MVP has no later opt-out control. Authorized staff may browse recent acknowledged customers or search exact names, and duplicate paid visits are permitted.
* **Context:** The visit workflow needs a simple customer picker and a clear, lightweight privacy disclosure without a standalone privacy-settings phase.
* **Rationale:** One signup acknowledgement and strict authorization keep the MVP understandable while avoiding participation-state complexity. A global privacy-policy link keeps the disclosure accessible.
* **Alternatives considered:** Enrollment after the first rating, a dedicated opt-in/opt-out phase, repeated consent prompts, search-only customer selection, and duplicate-visit restrictions.
* **Consequences:** Existing customers are backfilled as acknowledged. Customer identities, visits, and customer ratings remain non-public. The former participation and opt-out decision is superseded, and opt-out controls move to post-MVP consideration.

## 2026-09-28 — Public restaurant discovery through safe database functions

* **Decision:** Restaurant listings and profiles are public without authentication. Name discovery uses a twelve-item alphabetical directory with literal substring search and previous/next navigation. Read-only database functions expose only safe listing fields and rating aggregates; Phase 3 returns the zero-rating state.
* **Context:** Phase 3 must let customers find restaurants and see rating presentation before Phase 4 creates visits and restaurant ratings.
* **Rationale:** Stable public functions provide a narrow privacy boundary and let Phase 4 add live aggregates without changing route or application contracts. Simple name search and pagination satisfy MVP discovery without introducing advanced filtering.
* **Alternatives considered:** Customer-only discovery, direct anonymous table access, list-only browsing, search-only browsing, unpaginated results, URL slugs, and pulling rating storage into Phase 3.
* **Consequences:** Public routes use restaurant UUIDs. Owner and staff identifiers remain private. Rating stars and counts show an honest empty state until Phase 4 changes the function internals to derive live aggregates.

## 2026-09-27 — Minimal always-eligible restaurant profiles

* **Decision:** Restaurant owners may manage a required name plus optional free-text address, phone, short description, and structured Monday-through-Sunday hours. Each day is closed or has one local opening/closing interval. Profiles have no draft or publication state, and customer rating summaries are derived rather than editable.
* **Context:** Phase 3 needs owner-managed listing data before discovery and live rating aggregates are added.
* **Rationale:** Optional core fields let owners build a useful profile gradually without introducing publishing workflow, address taxonomy, or complex scheduling infrastructure.
* **Alternatives considered:** Required complete profiles, structured US or international addresses, cuisine fields, images, manual publishing, free-text hours, split shifts, and overnight hours.
* **Consequences:** Future discovery treats every restaurant as eligible and omits missing details. Public access policies and routes are deferred to the discovery slice. Phase 4 will connect the existing empty rating-summary contract to submitted ratings.

## 2026-09-26 — Centralized route guards and minimal editable profiles

* **Decision:** Protected customer and restaurant route layouts use a shared trusted role guard. Cross-role requests redirect to the user's own portal. Customers and staff may edit their own names; owners may also edit their restaurant name. Email and roles remain read-only.
* **Context:** Phase 2 needed consistent route behavior and safe basic profile editing without pulling public restaurant listing work into the account phase.
* **Rationale:** Central guards remove inconsistent page checks, while server-action checks plus RLS and column privileges provide defense in depth.
* **Alternatives considered:** Per-page guards only, forbidden pages, forced logout on cross-role access, editable email, and Phase 3 listing fields.
* **Consequences:** Restaurant address, hours, cuisine, images, and public presentation remain Phase 3 work. Email changes require a future confirmation and reauthentication flow.

## 2026-09-25 — Exclusive account roles and direct employee access

* **Decision:** Customer, restaurant-owner, and restaurant-employee roles are exclusive. Owners and employees use dedicated signup paths and a shared role-aware login. One owner creates one restaurant; one employee may belong to one restaurant. An owner grants immediate access by entering an existing employee account's exact email and may revoke that access.
* **Context:** The MVP has no email confirmation or notification delivery, so email invitation links would add an insecure or unavailable workflow.
* **Rationale:** Existing-account matching and strict one-to-one constraints provide a small, testable employee access model with clear authorization boundaries.
* **Alternatives considered:** Multiple roles per account, emailed or manually shared invitation links, reusable restaurant codes, employee acceptance, and multi-restaurant accounts.
* **Consequences:** Employees must create an account before owners can add them. Removing membership returns an employee to an unassigned state without deleting their account.

## 2026-09-24 — Name-based customer lookup with email disambiguation

* **Decision:** Customer signup stores separate first and last names. Restaurant staff will search by those names, and authenticated staff authorized for a restaurant may see full customer email addresses to disambiguate matching names. The previously planned customer code is removed.
* **Context:** Restaurant workers should usually find a customer by name and need a unique identifier only when names are ambiguous.
* **Rationale:** Name-first search keeps routine staff interactions simple, while the Auth email already provides a unique account identifier.
* **Alternatives considered:** An app-generated customer code, always requiring email entry, masked email hints, and name-only selection.
* **Consequences:** Staff lookup must strictly enforce restaurant authorization because it exposes customer login identifiers and personal information. Email remains owned by Supabase Auth rather than duplicated in `customer_profiles`.

## 2026-09-21 — Manual paid visits and in-app rating prompt

* **Decision:** Restaurant staff identify a customer by name, using email to disambiguate matching names when necessary, then manually record a paid visit. The customer sees an in-app prompt and may rate the restaurant immediately. No separate staff visit confirmation is required.
* **Context:** Bookings and payments happen outside Dining Plus during the MVP.
* **Rationale:** This supports the core rating flow without payment, POS, booking, or notification integrations.
* **Alternatives considered:** Customer-entered payment, automated payment trigger, visit confirmation, email prompt.
* **Consequences:** A paid visit is an unverified staff assertion. Duplicate or false visit entry remains a product risk for MVP testing.

## 2026-09-21 — Customer participation and private reputation (superseded)

* **Decision:** A customer's first restaurant rating enables participation in customer ratings. Staff may rate that customer once for the rated visit. An explicit opt-out hides retained customer ratings from staff and blocks new ones; later restaurant ratings do not silently undo the opt-out. Participating customers see their own average and count; authorized restaurant staff see the aggregate and count, not individual ratings from other restaurants.
* **Context:** Customer reputation is sensitive and must not be public.
* **Rationale:** The privacy notice and opt-out give the customer control while retaining a simple two-sided rating flow.
* **Alternatives considered:** Opt-in before any restaurant review, deletion on opt-out, public customer ratings, individual rating visibility.
* **Consequences:** Participation and visibility checks apply to every customer-rating write and read.

## 2026-09-21 — Self-service accounts for the MVP

* **Decision:** Customers and restaurants can sign up without email confirmation. Anyone can create a restaurant account; its creator invites individual employees. No restaurant claim approval is required.
* **Context:** The MVP prioritizes a minimal account flow for initial testing.
* **Rationale:** Avoids a manual approval workflow and email-confirmation setup during Phase 1.
* **Alternatives considered:** Administrator claim approval, domain proof, email-confirmed signup, shared staff login.
* **Consequences:** Restaurant claims are not verified. Authentication, ownership, membership, and access controls are still required so one account cannot access another restaurant's private data.

## 2026-09-24 — Single production deployment and shared Supabase project

* **Decision:** Deploy only the `main` branch to a generated Vercel production domain. Disable preview deployments and temporarily use the existing hosted Supabase project for both local development and production.
* **Context:** The MVP needs a deployable environment with minimal infrastructure and no custom domain yet.
* **Rationale:** Vercel's Git integration and one Supabase project provide the smallest workable deployment setup.
* **Alternatives considered:** Vercel preview deployments, a custom domain, and separate development and production Supabase projects.
* **Consequences:** Every push to `main` can affect production immediately, and local database or Auth activity shares production state. Changes require local CI and reviewed migrations; linked resets are prohibited once real data exists. A separate production Supabase project is required when real usage makes sharing unsafe.
