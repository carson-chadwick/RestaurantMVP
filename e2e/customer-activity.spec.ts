import { expect, test, type Page } from "@playwright/test";

const CUSTOMER_EMAIL = "demo.customer.avery@example.com";

async function signInAsCustomer(page: Page) {
  const password = process.env.DINING_PLUS_DEMO_PASSWORD;
  if (!password) {
    throw new Error(
      "DINING_PLUS_DEMO_PASSWORD is missing. Run npm run demo:seed or set the environment variable before running the E2E test.",
    );
  }

  await page.goto("/login");
  await page.getByLabel("Email").fill(CUSTOMER_EMAIL);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/customer$/);
}

test("unauthenticated users are redirected from customer Activity", async ({
  page,
}) => {
  await page.goto("/customer/activity");

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Welcome back" }),
  ).toBeVisible();
});

test("customer can sign in and open Activity", async ({ page }) => {
  await signInAsCustomer(page);
  await page.getByRole("link", { name: /^Activity/ }).click();

  await expect(page).toHaveURL(/\/customer\/activity$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Reviews and progress." }),
  ).toBeVisible();
});

test("customer is redirected away from the restaurant portal", async ({
  page,
}) => {
  await signInAsCustomer(page);

  await page.goto("/restaurant");

  await expect(page).toHaveURL(/\/customer$/);
  await expect(
    page.getByRole("navigation", { name: "Customer navigation" }),
  ).toBeVisible();
});
