# Product Requirements

## Product and MVP

Dining Plus is a two-sided restaurant reputation web app. Customers give restaurants 1–5 star ratings, and authorized restaurant staff give eligible customers 1–5 star ratings. The MVP uses manually recorded paid visits; it does not process payments, import bookings, or verify transactions.

## Customer flow

1. A customer creates an account with their first name, last name, email, and password and must acknowledge that authorized restaurant staff may use their name and email to record visits and may rate them after an eligible restaurant rating. Email confirmation is not required for the MVP.
2. Authorized restaurant staff browse recent customers or search an exact first and last name, then record a paid visit for their restaurant. The protected workflow shows full customer email addresses for identification. This is a staff assertion that payment happened outside Dining Plus, not a payment in the app.
3. The customer sees the pending visit in the app and can submit one 1–5 star restaurant rating for it. The rating immediately contributes to the restaurant average and count. No staff confirmation is required.
4. The customer is eligible for a restaurant-to-customer rating after rating that restaurant for the visit, as acknowledged during signup.
5. The customer can see their own average customer rating, rating count, and individual received ratings identified by restaurant and visit date. The submitting staff member's identity is not shown.
6. A customer may update their own first and last name. Their account email is visible to them but cannot be changed in the MVP.
7. Restaurant profiles include a name and may include a free-text address, phone number, short description, and one local-time opening interval per weekday. Public discovery and profile routes are implemented separately within Phase 3.
8. Anyone may browse an alphabetical public restaurant directory, search restaurant names, and open a restaurant profile without signing in. Directory results use twelve-item pages with previous and next navigation.

## Restaurant owner and employee flow

1. Anyone may create a dedicated restaurant-owner account and one restaurant without a restaurant claim approval or email confirmation step. The creator manages that restaurant and its employee access.
2. An employee first creates a dedicated employee account. The owner grants immediate access by entering the employee account's exact email address and may later revoke it. An employee may belong to only one restaurant in the MVP.
3. Staff browse the 20 newest customer accounts or search by exact first and last name before recording a paid visit. The authorized workflow shows customer email addresses, and a paid visit creates an in-app restaurant rating prompt for that customer.
4. Once that customer has rated the restaurant for the visit, staff for that restaurant may submit one 1–5 star customer rating for the visit. No separate visit confirmation is required.
5. Authorized restaurant staff may see customer aggregate ratings and counts only in the protected visit workflow. They do not see individual customer-rating values, including ratings submitted by their own restaurant.
6. Owners and employees may update their own first and last name. An owner may also update their restaurant name; employees may view but not change their assigned restaurant. Account email is read-only.
7. Owners may manage their restaurant's optional address, phone, description, and weekly hours. Employees may view these details but cannot change them. Only the name is required, and restaurants do not have a draft or manual publication state.

## Ratings and privacy rules

* Each paid visit can have at most one customer-to-restaurant rating and one restaurant-to-customer rating. Separate paid visits can receive separate ratings.
* Restaurant profile rating summaries expose an average and count derived from submitted customer ratings. Before ratings exist, the profile displays “No ratings yet” and a count of zero; these values are never owner-editable.
* Restaurant directory cards and profiles display five accessible stars and the rating count. Numeric averages are not shown as separate visible text in the MVP. Until Phase 4 creates rating records, all restaurants use the zero-rating state.
* Restaurant averages and counts use submitted customer-to-restaurant ratings and are visible on restaurant profiles. Customer names are not public on restaurant ratings.
* Customer averages and counts use submitted restaurant-to-customer ratings. They are available only to the customer and authenticated, authorized restaurant staff. They are never public.
* Customer browsing and exact-name search are available only to authenticated staff authorized for a restaurant. They expose first name, last name, and full email address so staff can identify customers and record a paid visit.
* All actions and sensitive reads require server-side authorization. Self-service restaurant creation does not grant access to another restaurant's employees, visits, or ratings.
* Customer, restaurant-owner, and restaurant-employee roles are exclusive for the MVP. One email account cannot hold multiple roles, an owner may create one restaurant, and an employee may access one restaurant.
* Authenticated users who open another role's portal are redirected to their own portal. Profile and restaurant mutations require server-side role checks and matching database RLS policies.

## MVP boundaries

Bookings and payments take place outside Dining Plus. There is no booking system, payment collection, POS integration, automatic transaction matching, staff visit confirmation, written review, public customer reputation, employee invitation email, or other email/push notification in the MVP. The rating prompt appears in the app when the customer next opens it.

Restaurant cuisine, images, website links, holiday hours, split hours, overnight hours, time-zone management, customer rating opt-out controls, duplicate-visit detection, and rating edits are outside the MVP scope.
