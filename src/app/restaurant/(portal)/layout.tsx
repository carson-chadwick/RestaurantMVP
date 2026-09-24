import { requireRestaurantStaff } from "@/features/auth/guards";

export default async function RestaurantPortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireRestaurantStaff();
  return children;
}
