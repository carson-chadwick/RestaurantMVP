import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

import { createClient } from "@supabase/supabase-js";

const DEMO_ENV_FILE = ".env.demo.local";
const SHARED_HOURS = Object.fromEntries(
  [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ].map((day, index) => [
    day,
    index === 6 ? { closed: true } : { open: "11:00", close: "21:00" },
  ]),
);

export const demoRestaurants = [
  {
    key: "cedar",
    name: "Cedar & Salt (Demo)",
    owner: ["Olive", "Hart"],
    employee: ["Noah", "Reed"],
    address: "101 Demo Way, Provo, UT 84601",
    phone: "+1 202-555-0101",
    description:
      "A fictional neighborhood restaurant used to demonstrate Dining Plus.",
  },
  {
    key: "northstar",
    name: "Northstar Noodles (Demo)",
    owner: ["Mina", "Park"],
    employee: ["Eli", "Chen"],
    address: "202 Sample Street, Provo, UT 84601",
    phone: "+1 202-555-0102",
    description:
      "A fictional noodle shop used for persistent product demonstrations.",
  },
  {
    key: "juniper",
    name: "Juniper Table (Demo)",
    owner: ["Clara", "Moss"],
    employee: ["Theo", "Lane"],
    address: "303 Example Avenue, Provo, UT 84601",
    phone: "+1 202-555-0103",
    description:
      "A fictional dining room used to demonstrate private two-sided ratings.",
  },
];

export const demoCustomers = [
  ["avery", "Avery", "Stone"],
  ["jordan", "Jordan", "Lee"],
  ["morgan", "Morgan", "Rivera"],
  ["riley", "Riley", "Chen"],
  ["casey", "Casey", "Brooks"],
  ["taylor", "Taylor", "Reed"],
].map(([key, firstName, lastName]) => ({ key, firstName, lastName }));

export const demoScenarios = [
  {
    restaurant: "cedar",
    customer: "avery",
    state: "complete",
    restaurantStars: 5,
    customerStars: 5,
  },
  {
    restaurant: "cedar",
    customer: "jordan",
    state: "complete",
    restaurantStars: 4,
    customerStars: 4,
  },
  { restaurant: "cedar", customer: "morgan", state: "awaiting" },
  {
    restaurant: "northstar",
    customer: "riley",
    state: "complete",
    restaurantStars: 5,
    customerStars: 3,
  },
  {
    restaurant: "northstar",
    customer: "casey",
    state: "ready",
    restaurantStars: 3,
  },
  {
    restaurant: "northstar",
    customer: "avery",
    state: "complete",
    restaurantStars: 4,
    customerStars: 5,
  },
  {
    restaurant: "juniper",
    customer: "taylor",
    state: "complete",
    restaurantStars: 2,
    customerStars: 2,
  },
  {
    restaurant: "juniper",
    customer: "jordan",
    state: "complete",
    restaurantStars: 5,
    customerStars: 5,
  },
  {
    restaurant: "juniper",
    customer: "morgan",
    state: "ready",
    restaurantStars: 4,
  },
];

function parseEnvFile(path) {
  if (!existsSync(path)) return {};
  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        return [
          line.slice(0, separator),
          line.slice(separator + 1).replace(/^['"]|['"]$/g, ""),
        ];
      }),
  );
}

export function loadDemoEnvironment() {
  const local = parseEnvFile(".env.local");
  const demo = parseEnvFile(DEMO_ENV_FILE);
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? local.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    local.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  let password =
    process.env.DINING_PLUS_DEMO_PASSWORD ?? demo.DINING_PLUS_DEMO_PASSWORD;

  if (!url || !key) throw new Error("Missing public Supabase configuration.");
  if (!password) {
    password = randomBytes(24).toString("base64url");
    writeFileSync(
      DEMO_ENV_FILE,
      `# Private, persistent demo-account credential. Never commit this file.\nDINING_PLUS_DEMO_PASSWORD=${password}\n`,
      { encoding: "utf8", flag: "wx" },
    );
    console.log(`Created private demo credentials in ${DEMO_ENV_FILE}.`);
  }
  if (password.length < 16) {
    throw new Error(
      "DINING_PLUS_DEMO_PASSWORD must be at least 16 characters.",
    );
  }
  return { key, password, url };
}

export function accountEmail(kind, key) {
  return `demo.${kind}.${key}@example.com`;
}

function clientFor(url, key) {
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function ensureAccount(config, account) {
  const client = clientFor(config.url, config.key);
  const email = accountEmail(account.kind, account.key);
  const signIn = await client.auth.signInWithPassword({
    email,
    password: config.password,
  });
  if (!signIn.error && signIn.data.user)
    return { client, created: false, email, user: signIn.data.user };

  const signUp = await client.auth.signUp({
    email,
    password: config.password,
    options: { data: account.metadata },
  });
  if (signUp.error) throw new Error(`Could not create demo account ${email}.`);
  if (signUp.data.session && signUp.data.user) {
    return { client, created: true, email, user: signUp.data.user };
  }

  const retry = await client.auth.signInWithPassword({
    email,
    password: config.password,
  });
  if (retry.error || !retry.data.user) {
    throw new Error(`Could not sign in demo account ${email}.`);
  }
  return { client, created: false, email, user: retry.data.user };
}

async function ensureRestaurantProfile(owner, restaurant) {
  const existing = await owner.client
    .from("restaurants")
    .select("id")
    .eq("owner_user_id", owner.user.id)
    .single();
  if (existing.error || !existing.data) {
    throw new Error(`Could not load ${restaurant.name}.`);
  }
  const update = await owner.client
    .from("restaurants")
    .update({
      name: restaurant.name,
      address: restaurant.address,
      phone: restaurant.phone,
      description: restaurant.description,
      weekly_hours: SHARED_HOURS,
    })
    .eq("id", existing.data.id);
  if (update.error) throw new Error(`Could not update ${restaurant.name}.`);
  return existing.data.id;
}

async function ensureEmployee(owner, employee) {
  const listed = await owner.client.rpc("list_restaurant_employees");
  if (listed.error)
    throw new Error(`Could not inspect employees for ${owner.email}.`);
  if (listed.data.some((row) => row.user_id === employee.user.id)) return false;
  const granted = await owner.client.rpc("grant_restaurant_employee_access", {
    employee_email: employee.email,
  });
  if (granted.error) throw new Error(`Could not assign ${employee.email}.`);
  return true;
}

async function customerState(customer, restaurantName) {
  const [visits, history] = await Promise.all([
    customer.client.rpc("list_customer_restaurant_visits"),
    customer.client.rpc("list_customer_rating_history"),
  ]);
  if (visits.error || history.error)
    throw new Error(`Could not inspect ${customer.email}.`);
  const matchingVisits = visits.data.filter(
    (visit) => visit.restaurant_name === restaurantName,
  );
  const ratedVisitIds = new Set(history.data.map((rating) => rating.visit_id));
  return { matchingVisits, ratedVisitIds };
}

async function ensureScenario(staff, customer, restaurantName, scenario) {
  let state = await customerState(customer, restaurantName);
  let visit =
    scenario.state === "awaiting"
      ? state.matchingVisits.find((item) => item.stars === null)
      : scenario.state === "ready"
        ? state.matchingVisits.find(
            (item) =>
              item.stars !== null && !state.ratedVisitIds.has(item.visit_id),
          )
        : state.matchingVisits.find((item) =>
            state.ratedVisitIds.has(item.visit_id),
          );

  if (visit) return false;

  visit = state.matchingVisits.find((item) => item.stars === null);
  if (!visit) {
    const recorded = await staff.client.rpc("record_paid_visit", {
      target_customer_user_id: customer.user.id,
    });
    if (recorded.error || !recorded.data) {
      throw new Error(`Could not record the ${restaurantName} demo visit.`);
    }
    state = await customerState(customer, restaurantName);
    visit = state.matchingVisits.find(
      (item) => item.visit_id === recorded.data,
    );
  }
  if (!visit)
    throw new Error(`Could not resolve the ${restaurantName} demo visit.`);
  if (scenario.state === "awaiting") return true;

  if (visit.stars === null) {
    const ratedRestaurant = await customer.client.rpc(
      "submit_restaurant_rating",
      {
        target_visit_id: visit.visit_id,
        rating_stars: scenario.restaurantStars,
      },
    );
    if (ratedRestaurant.error) {
      throw new Error(`Could not rate ${restaurantName} in the demo flow.`);
    }
  }
  if (scenario.state === "ready") return true;

  const ratedCustomer = await staff.client.rpc("submit_customer_rating", {
    target_visit_id: visit.visit_id,
    rating_stars: scenario.customerStars,
  });
  if (ratedCustomer.error) {
    throw new Error(`Could not complete the ${restaurantName} demo flow.`);
  }
  return true;
}

export async function seedDemoData() {
  const config = loadDemoEnvironment();
  const restaurants = new Map();
  const customers = new Map();
  const counts = {
    accountsCreated: 0,
    employeesAssigned: 0,
    scenariosCreated: 0,
  };

  for (const restaurant of demoRestaurants) {
    const owner = await ensureAccount(config, {
      kind: "owner",
      key: restaurant.key,
      metadata: {
        account_type: "restaurant_owner",
        first_name: restaurant.owner[0],
        last_name: restaurant.owner[1],
        restaurant_name: restaurant.name,
      },
    });
    const employee = await ensureAccount(config, {
      kind: "employee",
      key: restaurant.key,
      metadata: {
        account_type: "restaurant_employee",
        first_name: restaurant.employee[0],
        last_name: restaurant.employee[1],
      },
    });
    counts.accountsCreated += Number(owner.created) + Number(employee.created);
    await ensureRestaurantProfile(owner, restaurant);
    counts.employeesAssigned += Number(await ensureEmployee(owner, employee));
    restaurants.set(restaurant.key, { employee, owner });
  }

  for (const customer of demoCustomers) {
    const account = await ensureAccount(config, {
      kind: "customer",
      key: customer.key,
      metadata: {
        account_type: "customer",
        first_name: customer.firstName,
        last_name: customer.lastName,
        identity_disclosure_acknowledged: true,
      },
    });
    counts.accountsCreated += Number(account.created);
    customers.set(customer.key, account);
  }

  for (const scenario of demoScenarios) {
    const restaurant = demoRestaurants.find(
      (item) => item.key === scenario.restaurant,
    );
    counts.scenariosCreated += Number(
      await ensureScenario(
        restaurants.get(scenario.restaurant).employee,
        customers.get(scenario.customer),
        restaurant.name,
        scenario,
      ),
    );
  }

  console.log(
    `Demo data is ready (${counts.accountsCreated} accounts created, ${counts.employeesAssigned} employees assigned, ${counts.scenariosCreated} scenarios added).`,
  );
  console.log("Account emails are documented in README.md.");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  seedDemoData().catch((error) => {
    console.error(
      error instanceof Error ? error.message : "Demo seeding failed.",
    );
    process.exitCode = 1;
  });
}
