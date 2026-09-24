# Database Schema

This is the Phase 0 logical schema. Implement it through version-controlled Supabase migrations in later phases. Supabase Auth owns credentials and sessions; application tables reference its user IDs.

## Entities

| Entity | Minimum fields and purpose |
| --- | --- |
| `customer_profiles` | `user_id` (PK, Auth user), display name, unique customer code, participation state. The code helps staff confirm a name search result. |
| `restaurants` | `id` (PK), owner Auth user ID, profile name and basic listing details. |
| `restaurant_employees` | Restaurant ID and employee Auth user ID (composite unique key), invitation/active status. Individual accounts identify staff actions. |
| `paid_visits` | `id` (PK), restaurant ID, customer user ID, recording staff user ID, recorded time. Represents staff's manual assertion of an outside payment; it stores no payment credentials or transaction data. |
| `restaurant_ratings` | Visit ID (unique), customer user ID, restaurant ID, integer stars, submission time. |
| `customer_ratings` | Visit ID (unique), customer user ID, restaurant ID, rating staff user ID, integer stars, submission time. |

## Relationships

* A customer profile belongs to one Auth user. A restaurant has one owner Auth user and may have many employee memberships.
* A paid visit belongs to one restaurant and one customer and records the employee or owner who entered it.
* Each rating belongs to one paid visit. The rating's customer and restaurant must match that visit. A restaurant rating is submitted by that customer; a customer rating is submitted by active staff of that restaurant.
* Restaurant and customer averages and counts are derived from rating rows rather than stored as independent sources of truth.

## Constraints and Business Rules

* Stars are integers from 1 through 5. Unique visit IDs in each rating table permit at most one rating per side per paid visit; a customer and restaurant may have multiple distinct visits.
* Staff may create paid visits only for their own restaurant, after identifying the customer by name and submitting the code supplied by that customer for server verification. Customer search results must not reveal the code. The customer may create a restaurant rating only for their own recorded visit.
* A customer rating requires a restaurant rating for the same visit and current customer participation. Staff may rate only visits at their restaurant. No separate confirmation record is needed.
* The first restaurant rating enables customer participation and triggers the privacy notice. An explicit opt-out takes precedence over later restaurant ratings until the customer opts in again. Opt-out prevents new customer ratings and hides retained customer ratings and aggregates from restaurant staff.
* RLS and trusted server logic must prevent public reads of customer ratings, visits, customer codes, and participation state. A customer may read their own aggregate; authorized restaurant staff may read an opted-in customer's aggregate and count, but not other restaurants' individual customer rating rows.
* Do not assume email confirmation, restaurant claim approval, booking records, payment transactions, or external integrations in this schema.
