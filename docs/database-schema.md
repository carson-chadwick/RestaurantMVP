# Database Schema

This is the Phase 0 logical schema. Implement it through version-controlled Supabase migrations in later phases. Supabase Auth owns credentials and sessions; application tables reference its user IDs.

## Entities

| Entity | Minimum fields and purpose |
| --- | --- |
| `customer_profiles` | `user_id` (PK, Auth user), first name, last name, and identity-disclosure acknowledgement time. Authentication email remains owned by Supabase Auth and is exposed only through authorized staff workflows. |
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
* Customer signup requires identity-sharing and two-sided-rating acknowledgement. Existing customer rows are backfilled as acknowledged; the MVP has no later opt-out state.
* A restaurant name is required. Address is one trimmed free-text value; phone and description are optional trimmed values. Weekly hours contain exactly Monday through Sunday, with each day either closed or one opening/closing interval. Closing must be later than opening, so split and overnight hours are not supported in the MVP.
* Restaurant profiles have no draft or publication state. Optional details may be incomplete, and blank optional values are stored as null. Customer rating averages and counts are derived from ratings rather than editable profile fields.
* Restaurant creation, account-role creation, and the corresponding profile are atomic with Auth signup. Only a restaurant owner may grant or revoke membership for their restaurant, and grants require an existing unassigned employee account matched by exact email.
* Customers and staff may update only their own first and last name. Owners may update only the name of their own restaurant. Column grants prevent profile updates from changing user IDs, roles, ownership, timestamps, or memberships; update timestamps are maintained by database triggers.
* Staff may browse acknowledged customers or search exact first and last names and may create paid visits only for their own restaurant. The protected workflow may expose Auth email addresses. A customer may create one immutable restaurant rating only for their own recorded visit.
* A customer rating requires a restaurant rating for the same visit. Staff may rate only visits at their restaurant. No separate confirmation record is needed.
* RLS and trusted server logic prevent public reads of customer ratings, visits, customer profiles, and Auth email addresses. A customer may read their own aggregate and individual received-rating history without staff identity. Authorized restaurant staff may read customer aggregates only through the visit workflow and cannot read individual customer-rating values.
* Anonymous and authenticated visitors access restaurant listings through read-only database functions that expose only restaurant ID, public profile fields, and aggregate restaurant rating values. The underlying restaurant table remains protected, so owner IDs and timestamps are not public.
* Public restaurant name search is a case-insensitive literal substring match, sorted by normalized name and restaurant ID. Database functions cap result size and support offset pagination. Until restaurant ratings are implemented, the same public contract returns a null average and zero count.
* Do not assume email confirmation, restaurant claim approval, booking records, payment transactions, or external integrations in this schema.
