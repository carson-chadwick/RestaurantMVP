create table public.customer_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_profiles_first_name_length
    check (char_length(first_name) between 1 and 50 and first_name = btrim(first_name)),
  constraint customer_profiles_last_name_length
    check (char_length(last_name) between 1 and 50 and last_name = btrim(last_name))
);

alter table public.customer_profiles enable row level security;

create policy "Customers can read their own profile"
on public.customer_profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.create_customer_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  customer_first_name text := btrim(new.raw_user_meta_data ->> 'first_name');
  customer_last_name text := btrim(new.raw_user_meta_data ->> 'last_name');
begin
  if new.raw_user_meta_data ->> 'account_type' is distinct from 'customer' then
    return new;
  end if;

  if customer_first_name is null
    or char_length(customer_first_name) not between 1 and 50
    or customer_last_name is null
    or char_length(customer_last_name) not between 1 and 50 then
    raise exception 'Valid customer first and last names are required.';
  end if;

  insert into public.customer_profiles (user_id, first_name, last_name)
  values (new.id, customer_first_name, customer_last_name);

  return new;
end;
$$;

revoke all on function public.create_customer_profile() from public;

create trigger create_customer_profile_after_signup
after insert on auth.users
for each row execute function public.create_customer_profile();
