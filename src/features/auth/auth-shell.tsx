import { Brand } from "@/components/brand";
import { DarkHeader } from "@/components/dark-header";

export function AuthShell({
  title,
  description,
  children,
}: Readonly<{
  title: string;
  description: string;
  children: React.ReactNode;
}>) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <DarkHeader />
      <div className="pointer-events-none absolute -bottom-44 -left-36 h-96 w-96 rounded-full bg-[#e8dfcf]/60 blur-3xl" />
      <div className="relative flex justify-center px-4 py-10 sm:px-6 sm:py-14">
        <section className="ui-card w-full max-w-md overflow-hidden">
          <div className="bg-[var(--night)] px-6 py-7 text-white sm:px-10">
            <Brand inverse />
            <p className="mt-7 text-xs font-bold tracking-[0.18em] text-[#e5a57d] uppercase">
              Welcome to the table
            </p>
            <h1 className="mt-3 text-4xl text-white">{title}</h1>
            <p className="mt-3 leading-7 text-white/70">{description}</p>
          </div>
          <div className="p-6 sm:p-10">{children}</div>
        </section>
      </div>
    </main>
  );
}
