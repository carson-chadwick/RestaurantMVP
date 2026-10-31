import { DarkHeader } from "@/components/dark-header";
import { requireCustomer } from "@/features/auth/guards";
import { CustomerNavigation } from "@/features/customers/navigation";
import {
  loadCustomerContributionCount,
  loadCustomerVisits,
} from "@/features/visits/data";

export default async function CustomerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireCustomer();
  const [visitsResult, contributionResult] = await Promise.allSettled([
    loadCustomerVisits(),
    loadCustomerContributionCount(),
  ]);
  const pendingCount =
    visitsResult.status === "fulfilled"
      ? visitsResult.value.filter((visit) => visit.stars === null).length
      : 0;
  const points =
    contributionResult.status === "fulfilled"
      ? contributionResult.value * 10
      : null;

  return (
    <>
      <DarkHeader>
        <CustomerNavigation pendingCount={pendingCount} points={points} />
      </DarkHeader>
      {children}
    </>
  );
}
