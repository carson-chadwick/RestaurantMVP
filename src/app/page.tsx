import Image from "next/image";
import Link from "next/link";
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
              Two-sided reputation for restaurants
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-medium text-white sm:text-7xl lg:text-[5.5rem]">
              Better guests. Better restaurants.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-[#e8e2da] sm:text-xl">
              Dining+ is the restaurant reputation platform where feedback goes both
              ways—customers review hospitality, and restaurant teams privately
              rate eligible guests after a visit.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link href="/restaurant/signup" className="ui-button-primary">
                Create a restaurant account
              </Link>
              <a href="#how-it-works" className="ui-button-inverse">
                See how it works <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="ui-eyebrow">The Dining+ difference</p>
            <h2 className="mt-4 text-4xl text-[var(--ink)] sm:text-6xl">
              Reputation goes both ways.
            </h2>
            <p className="mt-5 text-lg text-[var(--ink-soft)]">
              Unlike a standard review directory, Dining+ gives restaurants and
              customers useful feedback from the same dining relationship.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <article className="ui-card p-7 sm:p-10">
              <p className="ui-eyebrow">01 / Diner to restaurant</p>
              <h3 className="mt-5 text-3xl text-[var(--ink)] sm:text-4xl">
                Guests recognize great hospitality.
              </h3>
              <p className="mt-5 leading-7 text-[var(--ink-soft)]">
                Customers share stars and written reviews after visits added by
                restaurant staff, building a useful public reputation.
              </p>
            </article>
            <article className="ui-card p-7 sm:p-10">
              <p className="ui-eyebrow">02 / Restaurant to diner</p>
              <h3 className="mt-5 text-3xl text-[var(--ink)] sm:text-4xl">
                Restaurants recognize great guests.
              </h3>
              <p className="mt-5 leading-7 text-[var(--ink-soft)]">
                Authorized teams privately rate eligible customers, adding
                context that supports respectful service and stronger repeat
                relationships.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--surface-subtle)] px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1.1fr_.9fr] lg:items-start">
          <div>
            <p className="ui-eyebrow">Built for restaurant relationships</p>
            <h2 className="mt-4 max-w-xl text-4xl text-[var(--ink)] sm:text-6xl">
              Know your reputation—and your guests.
            </h2>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--ink-soft)]">
              Dining+ helps restaurant teams attract new diners, understand the
              relationships behind their feedback, and give thoughtful guests a
              reason to return.
            </p>
          </div>
          <ol className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {[
              [
                "01",
                "Build public trust",
                "Pair star ratings with anonymous written experiences from customers.",
              ],
              [
                "02",
                "Understand your customers",
                "Use private guest reputation inside authorized restaurant workflows.",
              ],
              [
                "03",
                "Strengthen repeat relationships",
                "Recognize the customers who help create respectful dining experiences.",
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
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_.9fr] lg:items-center">
          <div>
            <p className="ui-eyebrow">Benefits for customers</p>
            <h2 className="mt-4 max-w-3xl text-4xl text-[var(--ink)] sm:text-5xl">
              More reasons to participate.
            </h2>
            <p className="mt-5 max-w-3xl leading-7 text-[var(--ink-soft)]">
              Customers can discover restaurants, read written experiences, earn
              points and badges for contributing, and privately understand the
              reputation they build as guests.
            </p>
          </div>
          <div className="ui-card p-7 sm:p-9">
            <p className="font-semibold text-[var(--ink)]">
              Discover. Review. Earn recognition.
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
              Restaurant discovery gives customers immediate value, while
              progress and private reputation make every contribution matter.
            </p>
            <Link href="/signup" className="ui-button-secondary mt-6">
              Create a customer account
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 sm:pb-32">
        <div className="ui-card-dark mx-auto max-w-4xl px-6 py-16 text-center sm:px-12 sm:py-20">
          <p className="text-xs font-bold tracking-[0.2em] text-[#e5a57d] uppercase">
            Join the table
          </p>
          <h2 className="mt-4 text-4xl text-white sm:text-6xl">
            Build better customer relationships.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[#d8d1c8]">
            Give your restaurant a reputation system designed for both sides of
            the table.
          </p>
          <Link href="/restaurant/signup" className="ui-button-primary mt-8">
            Create a restaurant account
          </Link>
        </div>
      </section>
    </main>
  );
}
