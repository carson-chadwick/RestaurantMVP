import { requireCustomer } from "@/features/auth/guards";

export default async function CustomerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireCustomer();
  return children;
}
