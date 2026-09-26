import { existsSync, readFileSync } from "node:fs";

import { createClient } from "@supabase/supabase-js";

function parse(path) {
  if (!existsSync(path)) return {};
  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );
}

const environment = {
  ...parse(".env.local"),
  ...parse(".env.demo.local"),
  ...process.env,
};
const url = environment.NEXT_PUBLIC_SUPABASE_URL;
const key = environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const password = environment.DINING_PLUS_DEMO_PASSWORD;
if (!url || !key || !password)
  throw new Error("Demo security configuration is missing.");

const makeClient = () =>
  createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

async function signedInClient(email) {
  const client = makeClient();
  const result = await client.auth.signInWithPassword({ email, password });
  if (result.error) throw new Error(`Could not sign in ${email}.`);
  return client;
}

const anonymous = makeClient();
const publicRestaurants = await anonymous.rpc("list_public_restaurants", {
  search_text: "Demo",
  result_limit: 12,
  result_offset: 0,
});
const anonymousPrivate = await anonymous.rpc("get_customer_rating_summary");

const customer = await signedInClient("demo.customer.avery@example.com");
const [ownProfile, visits, restaurantRatings, customerRatings, staffQueue] =
  await Promise.all([
    customer.from("customer_profiles").select("user_id"),
    customer.from("paid_visits").select("id"),
    customer.from("restaurant_ratings").select("visit_id"),
    customer.from("customer_ratings").select("visit_id"),
    customer.rpc("list_staff_customer_rating_queue", {
      result_limit: 20,
      result_offset: 0,
    }),
  ]);

const employee = await signedInClient("demo.employee.cedar@example.com");
const [customerProfiles, individualRatings, customerHistory] =
  await Promise.all([
    employee.from("customer_profiles").select("user_id"),
    employee.from("customer_ratings").select("visit_id"),
    employee.rpc("list_customer_rating_history"),
  ]);

const checks = {
  anonymousPrivateDenied: Boolean(anonymousPrivate.error),
  customerDirectCustomerRatingsHidden:
    (customerRatings.data?.length ?? 0) === 0,
  customerDirectRestaurantRatingsHidden:
    (restaurantRatings.data?.length ?? 0) === 0,
  customerDirectVisitsHidden: (visits.data?.length ?? 0) === 0,
  customerOwnProfileOnly: ownProfile.data?.length === 1,
  customerStaffRpcDenied: Boolean(staffQueue.error),
  employeeCustomerHistoryDenied: Boolean(customerHistory.error),
  employeeCustomerProfilesHidden: (customerProfiles.data?.length ?? 0) === 0,
  employeeIndividualRatingsHidden: (individualRatings.data?.length ?? 0) === 0,
  publicDemoRestaurants: publicRestaurants.data?.length === 3,
};

console.log(JSON.stringify(checks, null, 2));
if (Object.values(checks).some((passed) => !passed)) process.exitCode = 1;
