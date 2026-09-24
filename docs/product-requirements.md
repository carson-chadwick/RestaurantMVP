# Product Requirements

## Product and MVP

Dining Plus is a two-sided restaurant reputation web app. Customers give restaurants 1–5 star ratings, and authorized restaurant staff give participating customers 1–5 star ratings. The MVP uses manually recorded paid visits; it does not process payments, import bookings, or verify transactions.

## Customer flow

1. A customer creates an account with their first name, last name, email, and password, then signs in. Email confirmation is not required for the MVP.
2. Restaurant staff find the customer by first and last name and record a paid visit for that restaurant. When names are ambiguous, the authenticated, authorized staff search may show full customer email addresses so staff can select the correct account. This is a staff assertion that payment happened outside Dining Plus, not a payment in the app.
3. The customer sees the pending visit in the app and can submit one 1–5 star restaurant rating for it. The rating immediately contributes to the restaurant average and count. No staff confirmation is required.
4. Submitting the first restaurant rating enables participation in customer ratings. A privacy notice explains this and provides an opt-out control. An explicit opt-out remains in effect until the customer chooses to opt in again; submitting another restaurant rating does not silently reverse it.
5. While participating, the customer can see their own average customer rating and rating count. The customer does not see individual employee ratings in the MVP.
6. A customer may update their own first and last name. Their account email is visible to them but cannot be changed in the MVP.
7. Restaurant profiles include a name and may include a free-text address, phone number, short description, and one local-time opening interval per weekday. Public discovery and profile routes are implemented separately within Phase 3.

## Restaurant owner and employee flow

1. Anyone may create a dedicated restaurant-owner account and one restaurant without a restaurant claim approval or email confirmation step. The creator manages that restaurant and its employee access.
2. An employee first creates a dedicated employee account. The owner grants immediate access by entering the employee account's exact email address and may later revoke it. An employee may belong to only one restaurant in the MVP.
3. Staff search customer accounts by first and last name before recording a paid visit. When multiple accounts share a name, the authorized search shows email addresses to disambiguate them. A paid visit creates an in-app restaurant rating prompt for that customer.
4. Once that customer has rated the restaurant for the visit and is participating, staff for that restaurant may submit one 1–5 star customer rating for the visit. No separate visit confirmation is required.
5. Authorized restaurant staff may see a participating customer's aggregate customer rating and rating count. They may not browse individual customer ratings from other restaurants.
6. Owners and employees may update their own first and last name. An owner may also update their restaurant name; employees may view but not change their assigned restaurant. Account email is read-only.
7. Owners may manage their restaurant's optional address, phone, description, and weekly hours. Employees may view these details but cannot change them. Only the name is required, and restaurants do not have a draft or manual publication state.

## Ratings and privacy rules

* Each paid visit can have at most one customer-to-restaurant rating and one restaurant-to-customer rating. Separate paid visits can receive separate ratings.
* Restaurant profile rating summaries expose an average and count derived from submitted customer ratings. Before ratings exist, the profile displays “No ratings yet” and a count of zero; these values are never owner-editable.
* Restaurant averages and counts use submitted customer-to-restaurant ratings and are visible on restaurant profiles. Customer names are not public on restaurant ratings.
* Customer averages and counts use submitted restaurant-to-customer ratings. They are available only to the participating customer and authenticated, authorized restaurant staff. They are never public.
* Opting out blocks new restaurant-to-customer ratings and hides the customer's existing aggregate from restaurant staff. Existing customer ratings are retained privately. The customer can still rate restaurants, and those restaurant ratings remain in the restaurant average.
* Customer search is available only to authenticated staff authorized for a restaurant. It exposes first name, last name, and full email address so staff can disambiguate customers with the same name and record a paid visit. An opted-out customer's reputation is not shown.
* All actions and sensitive reads require server-side authorization. Self-service restaurant creation does not grant access to another restaurant's employees, visits, or ratings.
* Customer, restaurant-owner, and restaurant-employee roles are exclusive for the MVP. One email account cannot hold multiple roles, an owner may create one restaurant, and an employee may access one restaurant.
* Authenticated users who open another role's portal are redirected to their own portal. Profile and restaurant mutations require server-side role checks and matching database RLS policies.

## MVP boundaries

Bookings and payments take place outside Dining Plus. There is no booking system, payment collection, POS integration, automatic transaction matching, staff visit confirmation, written review, public customer reputation, employee invitation email, or other email/push notification in the MVP. The rating prompt appears in the app when the customer next opens it.

Restaurant cuisine, images, website links, holiday hours, split hours, overnight hours, and time-zone management are also outside the initial profile scope.
