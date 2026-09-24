# Database Schema

This is the Phase 0 logical schema. Implement it through version-controlled Supabase migrations in later phases. Supabase Auth owns credentials and sessions; application tables reference its user IDs.

## Entities

| Entity | Minimum fields and purpose |
| --- | --- |
| `customer_profiles` | `user_id` (PK, Auth user), first name, last name, and participation state. Authentication email remains owned by Supabase Auth and may be used by authorized staff to disambiguate matching names. |
| `account_roles` | `user_id` (PK, Auth user) and one exclusive role: customer, restaurant owner, or restaurant employee. |
| `staff_profiles` | `user_id` (PK, Auth user), first name, and last name for owners and employees. |
| `restaurants` | `id` (PK), owner Auth user ID, required profile name, and optional address, phone, description, and structured weekly hours. |
| `restaurant_employees` | Restaurant ID and employee Auth user ID (composite unique key). A row grants immediate active access; removing it revokes access while retaining the employee account. |
| `paid_visits` | `id` (PK), restaurant ID, customer user ID, recording staff user ID, recorded time. Represents staff's manual assertion of an outside payment; it stores no payment credentials or transaction data. |
| `restaurant_ratings` | Visit ID (unique), customer user ID, restaurant ID, integer stars, submission time. |
| `customer_ratings` | Visit ID (unique), customer user ID, restaurant ID, rating staff user ID, integer stars, submission time. |

## Relationships

* Every application account has one permanent role. Customer details remain in `customer_profiles`; owner and employee names are in `staff_profiles`.
* A restaurant has one owner Auth user and may have many employee memberships. An owner may own one restaurant, and an employee may belong to one restaurant.
* A paid visit belongs to one restaurant and one customer and records the employee or owner who entered it.
* Each rating belongs to one paid visit. The rating's customer and restaurant must match that visit. A restaurant rating is submitted by that customer; a customer rating is submitted by active staff of that restaurant.
* Restaurant and customer averages and counts are derived from rating rows rather than stored as independent sources of truth.

## Constraints and Business Rules

* Stars are integers from 1 through 5. Unique visit IDs in each rating table permit at most one rating per side per paid visit; a customer and restaurant may have multiple distinct visits.
* A restaurant name is required. Address is one trimmed free-text value; phone and description are optional trimmed values. Weekly hours contain exactly Monday through Sunday, with each day either closed or one opening/closing interval. Closing must be later than opening, so split and overnight hours are not supported in the MVP.
* Restaurant profiles have no draft or publication state. Optional details may be incomplete, and blank optional values are stored as null. Customer rating averages and counts are derived from ratings rather than editable profile fields.
* Restaurant creation, account-role creation, and the corresponding profile are atomic with Auth signup. Only a restaurant owner may grant or revoke membership for their restaurant, and grants require an existing unassigned employee account matched by exact email.
* Customers and staff may update only their own first and last name. Owners may update only the name of their own restaurant. Column grants prevent profile updates from changing user IDs, roles, ownership, timestamps, or memberships; update timestamps are maintained by database triggers.
* Staff may create paid visits only for their own restaurant after identifying the customer by first and last name. Authorized staff search may expose the Auth email address when needed to disambiguate matching names. The customer may create a restaurant rating only for their own recorded visit.
* A customer rating requires a restaurant rating for the same visit and current customer participation. Staff may rate only visits at their restaurant. No separate confirmation record is needed.
* The first restaurant rating enables customer participation and triggers the privacy notice. An explicit opt-out takes precedence over later restaurant ratings until the customer opts in again. Opt-out prevents new customer ratings and hides retained customer ratings and aggregates from restaurant staff.
* RLS and trusted server logic must prevent public reads of customer ratings, visits, customer profiles, Auth email addresses, and participation state. A customer may read their own aggregate; authorized restaurant staff may read an opted-in customer's aggregate and count, but not other restaurants' individual customer rating rows.
* Do not assume email confirmation, restaurant claim approval, booking records, payment transactions, or external integrations in this schema.
