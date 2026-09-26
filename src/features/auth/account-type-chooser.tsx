import Link from "next/link";

const accountTypes = [
  {
    eyebrow: "For diners",
    title: "Customer",
    description:
      "Discover restaurants, rate your recorded visits, and view your private guest reputation.",
    href: "/signup/customer",
    action: "Create customer account",
  },
  {
    eyebrow: "For operators",
    title: "Restaurant owner",
    description:
      "Create your restaurant profile, manage employees, and record customer visits.",
    href: "/restaurant/signup",
    action: "Create owner account",
  },
  {
    eyebrow: "For restaurant teams",
    title: "Restaurant employee",
    description:
      "Create your staff account, then ask your restaurant owner to grant access.",
    href: "/employee/signup",
    action: "Create employee account",
  },
] as const;

export function AccountTypeChooser() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {accountTypes.map((accountType) => (
        <article
          key={accountType.title}
          className="ui-card flex h-full flex-col p-6 sm:p-8"
        >
          <p className="ui-eyebrow">{accountType.eyebrow}</p>
          <h2 className="mt-4 text-3xl text-[var(--ink)]">
            {accountType.title}
          </h2>
          <p className="mt-4 flex-1 leading-7 text-[var(--ink-soft)]">
            {accountType.description}
          </p>
          <Link
            href={accountType.href}
            className="ui-button-primary mt-7 w-full"
          >
            {accountType.action}
          </Link>
        </article>
      ))}
    </div>
  );
}
