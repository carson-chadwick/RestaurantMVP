import Image from "next/image";
import restaurantHero from "../../images/restuarant.jpg";

import { Brand } from "@/components/brand";
import { PublicAccountNavigation } from "@/features/auth/public-account-navigation";

export default async function Home() {
  return (
    <main>
      <section className="relative isolate flex min-h-[92svh] overflow-hidden bg-[var(--night)] text-white">
        <Image
          src={restaurantHero}
          alt="A warmly lit restaurant dining room prepared for guests"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(12,10,8,.82)_0%,rgba(15,12,10,.66)_46%,rgba(15,12,10,.86)_100%)]" />
        <div className="ui-container flex min-h-[92svh] flex-col">
          <header className="flex flex-wrap items-center justify-between gap-4 py-6">
            <Brand inverse />
            {await PublicAccountNavigation({
              includeBrowse: true,
              includeSignupAction: true,
              inverse: true,
            })}
          </header>
          <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
            <p className="text-xs font-bold tracking-[0.22em] text-[#e5a57d] uppercase">
              Reputation for both sides of the table
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-medium text-white sm:text-7xl lg:text-[5.5rem]">
              Better guests. Better restaurants.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-[#e8e2da] sm:text-xl">
              Dining+ gives restaurants and customers a shared reason to make
              every dining experience worth remembering.
            </p>
            <a
              href="#how-it-works"
              className="mt-12 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 text-xs font-bold tracking-[0.12em] text-white uppercase backdrop-blur-sm transition hover:bg-white/20"
            >
              See how it works <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="ui-eyebrow">A clearer dining picture</p>
            <h2 className="mt-4 text-4xl text-[var(--ink)] sm:text-6xl">
              Reputation goes both ways.
            </h2>
            <p className="mt-5 text-lg text-[var(--ink-soft)]">
              Recognize thoughtful guests and excellent hospitality through
              ratings tied to real, staff-recorded visits.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <article className="ui-card p-7 sm:p-10">
              <p className="ui-eyebrow">01 / House to diner</p>
              <h3 className="mt-5 text-3xl text-[var(--ink)] sm:text-4xl">
                Restaurants recognize their guests.
              </h3>
              <p className="mt-5 leading-7 text-[var(--ink-soft)]">
                Authorized teams record paid visits and build a private customer
                reputation after the guest shares their experience.
              </p>
            </article>
            <article className="ui-card p-7 sm:p-10">
              <p className="ui-eyebrow">02 / Diner to house</p>
              <h3 className="mt-5 text-3xl text-[var(--ink)] sm:text-4xl">
                Guests recognize great hospitality.
              </h3>
              <p className="mt-5 leading-7 text-[var(--ink-soft)]">
                Customers rate restaurants after a recorded visit, helping
                exceptional food, service, and care stand out publicly.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--surface-subtle)] px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1.1fr_.9fr] lg:items-start">
          <div>
            <p className="ui-eyebrow">Better hospitality</p>
            <h2 className="mt-4 max-w-xl text-4xl text-[var(--ink)] sm:text-6xl">
              Build a dining culture rooted in mutual respect.
            </h2>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--ink-soft)]">
              Dining+ makes appreciation visible on both sides. Public
              restaurant ratings help guests choose with confidence, while
              private customer ratings give restaurant teams useful context.
            </p>
          </div>
          <ol className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {[
              [
                "01",
                "Recognize great guests",
                "Reward respectful, reliable dining experiences.",
              ],
              [
                "02",
                "Celebrate hospitality",
                "Let excellent restaurant teams build a trusted reputation.",
              ],
              [
                "03",
                "Keep context responsible",
                "Protect customer reputation inside authorized workflows.",
              ],
            ].map(([number, title, copy]) => (
              <li key={number} className="flex gap-5 py-7">
                <span className="font-serif text-2xl font-semibold text-[var(--cognac)]">
                  {number}
                </span>
                <div>
                  <h3 className="font-sans text-base font-bold tracking-normal text-[var(--ink)]">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                    {copy}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 sm:py-32">
        <div className="ui-card-dark mx-auto max-w-4xl px-6 py-16 text-center sm:px-12 sm:py-20">
          <p className="text-xs font-bold tracking-[0.2em] text-[#e5a57d] uppercase">
            Join the table
          </p>
          <h2 className="mt-4 text-4xl text-white sm:text-6xl">
            Make every visit count.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[#d8d1c8]">
            Discover trusted restaurants or create an account to participate in
            a more accountable dining experience.
          </p>
          <div className="mt-8">
            {await PublicAccountNavigation({
              includeBrowse: true,
              includeSignupAction: true,
              inverse: true,
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
