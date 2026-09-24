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

## 2026-09-21 — Manual paid visits and in-app rating prompt

* **Decision:** Restaurant staff identify a customer by name and customer code, then manually record a paid visit. The customer sees an in-app prompt and may rate the restaurant immediately. No separate staff visit confirmation is required.
* **Context:** Bookings and payments happen outside Dining Plus during the MVP.
* **Rationale:** This supports the core rating flow without payment, POS, booking, or notification integrations.
* **Alternatives considered:** Customer-entered payment, automated payment trigger, visit confirmation, email prompt.
* **Consequences:** A paid visit is an unverified staff assertion. Duplicate or false visit entry remains a product risk for MVP testing.

## 2026-09-21 — Customer participation and private reputation

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
