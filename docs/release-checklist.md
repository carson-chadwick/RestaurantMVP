# MVP Release Checklist

Use the persistent fictional demo accounts documented in `README.md`. Keep the
shared password in `.env.demo.local`; never paste it into documentation, source
control, screenshots, or issue trackers.

## Automated gates

- Confirm `git status` contains only the intended release changes.
- Run `npm run db:migrations`, `npm run db:lint`, and `npm run db:push:dry-run`.
- Run `npm run demo:seed` twice; the second run must finish without adding a
  duplicate satisfied scenario.
- Run anonymous/private-access probes and `npm run ci`.
- Run `git diff --check`.

## Public and customer flow

- At 375px, tablet, and desktop widths, open `/`, `/privacy`, `/restaurants`,
  and a demo restaurant profile. Confirm no horizontal overflow and complete
  keyboard focus visibility.
- Search the directory, use pagination when available, and verify restaurant
  details, hours, live rating averages, counts, empty states, and retry links.
- Sign in as a demo customer. Confirm cross-role `/restaurant` navigation
  returns to `/customer` without ending the session.
- Verify profile editing, pending restaurant-rating visits, recent restaurant
  ratings, the private customer aggregate, and received-rating history.
- Submit one prepared rating and verify the public restaurant aggregate updates.
- Sign out and confirm protected routes return to login.

## Restaurant and employee flow

- Sign in as a demo owner. Verify restaurant profile editing, employee listing,
  customer browsing/search, customer aggregates, recent visits, and queues.
- Sign in as an assigned demo employee. Verify the restaurant is read-only,
  visit creation works, and an eligible customer rating can be submitted.
- Verify staff never see individual customer-rating values and never see the
  customer's restaurant-rating value in recent visits.
- Verify an unassigned employee sees the waiting state and cannot load visit
  tools. Verify cross-role `/customer` navigation returns staff to `/restaurant`.
- Check browser console and Vercel runtime logs for unexpected errors.

## Deployment

- The user commits and pushes the release candidate to `main` after all local
  gates pass.
- Confirm the Vercel deployment for that commit is healthy.
- Repeat the public checks and critical authenticated flows at
  `https://dining-plus.vercel.app`.
- Only then mark all Phase 6 roadmap items complete and record the MVP as ready
  for initial users.
