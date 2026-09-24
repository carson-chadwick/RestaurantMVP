# Product Requirements

## Product and MVP

Dining Plus is a two-sided restaurant reputation web app. Customers give restaurants 1–5 star ratings, and authorized restaurant staff give participating customers 1–5 star ratings. The MVP uses manually recorded paid visits; it does not process payments, import bookings, or verify transactions.

## Customer flow

1. A customer creates an account and signs in. Email confirmation is not required for the MVP.
2. Restaurant staff find the customer by name, confirm the customer's account code, and record a paid visit for that restaurant. This is a staff assertion that payment happened outside Dining Plus, not a payment in the app.
3. The customer sees the pending visit in the app and can submit one 1–5 star restaurant rating for it. The rating immediately contributes to the restaurant average and count. No staff confirmation is required.
4. Submitting the first restaurant rating enables participation in customer ratings. A privacy notice explains this and provides an opt-out control. An explicit opt-out remains in effect until the customer chooses to opt in again; submitting another restaurant rating does not silently reverse it.
5. While participating, the customer can see their own average customer rating and rating count. The customer does not see individual employee ratings in the MVP.

## Restaurant owner and employee flow

1. Anyone may create a restaurant account and profile without a restaurant claim approval or email confirmation step. The creator manages that restaurant and invites employees to access its portal.
2. An invited employee signs in with an individual account. Only the owner and employees assigned to that restaurant may act for it.
3. Staff search customer accounts by name and confirm the account code before recording a paid visit. A paid visit creates an in-app restaurant rating prompt for that customer.
4. Once that customer has rated the restaurant for the visit and is participating, staff for that restaurant may submit one 1–5 star customer rating for the visit. No separate visit confirmation is required.
5. Authorized restaurant staff may see a participating customer's aggregate customer rating and rating count. They may not browse individual customer ratings from other restaurants.

## Ratings and privacy rules

* Each paid visit can have at most one customer-to-restaurant rating and one restaurant-to-customer rating. Separate paid visits can receive separate ratings.
* Restaurant averages and counts use submitted customer-to-restaurant ratings and are visible on restaurant profiles. Customer names are not public on restaurant ratings.
* Customer averages and counts use submitted restaurant-to-customer ratings. They are available only to the participating customer and authenticated, authorized restaurant staff. They are never public.
* Opting out blocks new restaurant-to-customer ratings and hides the customer's existing aggregate from restaurant staff. Existing customer ratings are retained privately. The customer can still rate restaurants, and those restaurant ratings remain in the restaurant average.
* Customer search may expose only the information staff need to identify the account and record a paid visit. A name match alone is insufficient; staff must enter the code supplied by the customer, and the server must verify it. Search results must not reveal the code. An opted-out customer's reputation is not shown.
* All actions and sensitive reads require server-side authorization. Self-service restaurant creation does not grant access to another restaurant's employees, visits, or ratings.

## MVP boundaries

Bookings and payments take place outside Dining Plus. There is no booking system, payment collection, POS integration, automatic transaction matching, staff visit confirmation, written review, public customer reputation, or email/push notification in the MVP. The rating prompt appears in the app when the customer next opens it.
