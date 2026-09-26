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
* Customer identity-sharing acknowledgement at signup.
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
* [x] Establish basic application structure.

**Complete when:** The application runs locally and can be deployed successfully.

---

## Phase 2 — Accounts & Roles

Build the identity system.

* [x] Customer signup/login.
* [x] Restaurant signup/login.
* [x] Restaurant employee access.
* [x] Protected routes.
* [x] Role and permission enforcement.
* [x] Basic profiles.

**Complete when:** Each user type can authenticate and access only the appropriate areas.

---

## Phase 3 — Restaurants

Build the basic restaurant experience.

* [x] Restaurant profiles.
* [x] Restaurant listing/discovery.
* [x] Restaurant rating display.
* [x] Restaurant rating count.

**Complete when:** Customers can find restaurants and view their ratings.

---

## Phase 4 — Customers Rate Restaurants

Build the first side of the rating system.

* [x] Require customer identity-sharing and two-sided-rating acknowledgement at signup.
* [x] Allow authorized restaurant staff to browse recent customers or search an exact first and last name.
* [x] Show customer email addresses only inside the authorized staff workflow.
* [x] Allow staff to record a paid visit only for their own restaurant.
* [x] Display pending restaurant-rating visits on the customer's dashboard.
* [x] Submit one immutable 1–5 star restaurant rating per paid visit.
* [x] Associate the rating with the visit, customer, and restaurant.
* [x] Prevent invalid and unauthorized visits or ratings.
* [x] Calculate average restaurant rating.
* [x] Display the updated public restaurant rating and count immediately.

Paid visits are manual staff assertions about payment outside Dining Plus. This phase does not add visit confirmation, payment processing, POS integration, or automated transaction verification.

**Complete when:** Authorized staff can record a paid visit, the correct customer sees it, and that customer can submit one restaurant rating that immediately updates the restaurant's public average and count.

---

## Phase 5 — Restaurants Rate Customers

Build the second side of the rating system.

* [x] Employee portal.
* [x] Select an existing eligible paid visit for the staff member's restaurant.
* [x] Require the customer to have rated the restaurant for that visit.
* [x] Submit one 1–5 star customer rating per eligible visit.
* [x] Associate the rating with the existing visit, restaurant, customer, and rating staff member.
* [x] Calculate average customer rating.
* [x] Restrict customer rating visibility.

**Complete when:** Authorized restaurant staff can securely rate a customer once for an existing eligible visit without creating a second visit record.

---

## Phase 6 — MVP Polish

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
* Customer rating opt-out controls.
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

**Phase:** 6 — MVP Polish
**Status:** Phase 5 restaurant-to-customer ratings complete
**Next Goal:** Validate, harden, and deploy the complete MVP.
