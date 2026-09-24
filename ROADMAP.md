# Roadmap

## Product Goal

Build a two-sided reputation platform for restaurants.
The app will be called Dining Plus or Dining + for short

Customers rate restaurants, and authorized restaurant employees rate customers. The goal is to improve hospitality on both sides by giving restaurants and customers useful reputation information.

The MVP should be **small in scope but well-built**. Features included in the MVP should work reliably and securely. Do not add complexity for hypothetical future needs.

---

## MVP

The MVP will include:

* Customer accounts and login.
* Restaurant accounts and login.
* Restaurant employee portal.
* Restaurant profiles.
* Customer 1–5 star ratings of restaurants.
* Employee 1–5 star ratings of customers.
* Average restaurant rating.
* Average customer rating.
* Basic customer opt-in/opt-out.
* Customer ratings visible only to authorized users.

The MVP will **not** include:

* Payment processing.
* POS/payment processor integrations.
* Automatic transaction linking.
* Written reviews or notes.
* Public customer ratings/comments.
* Advanced analytics.
* Native mobile apps.

These may be considered after the core product has been validated.

---

# Development Roadmap

## Phase 0 — Design

Define the product before coding.

* [x] Finalize product requirements.
* [x] Define customer, restaurant, and employee user flows.
* [x] Define privacy and rating rules.
* [x] Choose technology stack.
* [x] Define architecture.
* [x] Define database schema.
* [x] Define authentication and authorization.

**Complete when:** The MVP is sufficiently defined to begin implementation.

---

## Phase 1 — Foundation

Create the basic application infrastructure.

* [x] Initialize application.
* [x] Configure database.
* [x] Configure authentication.
* [x] Configure migrations.
* [x] Configure hosting/deployment.
* [ ] Establish basic application structure.

**Complete when:** The application runs locally and can be deployed successfully.

---

## Phase 2 — Accounts & Roles

Build the identity system.

* [ ] Customer signup/login.
* [ ] Restaurant signup/login.
* [ ] Restaurant employee access.
* [ ] Protected routes.
* [ ] Role and permission enforcement.
* [ ] Basic profiles.

**Complete when:** Each user type can authenticate and access only the appropriate areas.

---

## Phase 3 — Restaurants

Build the basic restaurant experience.

* [ ] Restaurant profiles.
* [ ] Restaurant listing/discovery.
* [ ] Restaurant rating display.
* [ ] Restaurant rating count.

**Complete when:** Customers can find restaurants and view their ratings.

---

## Phase 4 — Customers Rate Restaurants

Build the first side of the rating system.

* [ ] Submit 1–5 star restaurant rating.
* [ ] Associate rating with customer and restaurant.
* [ ] Prevent invalid/unauthorized ratings.
* [ ] Calculate average restaurant rating.
* [ ] Display updated rating.

**Complete when:** Customers can successfully rate restaurants.

---

## Phase 5 — Customer Privacy

Implement customer participation controls.

* [ ] Customer opt-in/opt-out.
* [ ] Store participation preference.
* [ ] Enforce participation rules.
* [ ] Prevent public access to customer ratings.

**Complete when:** Customer privacy rules are enforced throughout the application.

---

## Phase 6 — Restaurants Rate Customers

Build the second side of the rating system.

* [ ] Employee portal.
* [ ] Select eligible customer.
* [ ] Submit 1–5 star customer rating.
* [ ] Associate rating with restaurant and customer.
* [ ] Calculate average customer rating.
* [ ] Restrict customer rating visibility.

**Complete when:** Authorized restaurant employees can securely rate participating customers.

---

## Phase 7 — MVP Polish

Make the complete product reliable enough for testing.

* [ ] Test complete customer flow.
* [ ] Test complete restaurant/employee flow.
* [ ] Handle errors and empty states.
* [ ] Verify mobile/responsive behavior.
* [ ] Review authentication and authorization.
* [ ] Review privacy and security.
* [ ] Fix critical bugs.
* [ ] Deploy testable MVP.

**Complete when:** The core product works end-to-end and is ready for initial users.

---

# Post-MVP

Consider only after testing the core product:

* Transaction linking.
* POS/payment integrations.
* Verified dining interactions.
* Written reviews.
* Public customer names on restaurant reviews.
* Internal restaurant notes.
* Advanced employee management.
* Analytics.
* Search/filtering improvements.
* Notifications.
* Native mobile apps.

---

# Development Principles

1. Follow the phases in order unless explicitly instructed otherwise.
2. Do not implement post-MVP features prematurely.
3. Prefer simple solutions over unnecessary abstractions.
4. MVP means **minimal scope, not poor quality**.
5. Follow the project's established security and engineering best practices.
6. Keep this roadmap updated as phases are completed or scope changes.

---

## Current Status

**Phase:** 1 — Foundation
**Status:** Application infrastructure, Supabase, migrations, and Vercel deployment configured
**Next Goal:** Establish the basic application structure.
