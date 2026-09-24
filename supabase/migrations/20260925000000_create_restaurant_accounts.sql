create type public.account_role as enum (
  'customer',
  'restaurant_owner',
  'restaurant_employee'
);

create table public.account_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.account_role not null,
  created_at timestamptz not null default now()
);

create table public.staff_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint staff_profiles_first_name_length
    check (char_length(first_name) between 1 and 50 and first_name = btrim(first_name)),
  constraint staff_profiles_last_name_length
    check (char_length(last_name) between 1 and 50 and last_name = btrim(last_name))
);

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null unique references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint restaurants_name_length
    check (char_length(name) between 2 and 100 and name = btrim(name))
);

create table public.restaurant_employees (
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  employee_user_id uuid not null unique references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (restaurant_id, employee_user_id)
);

insert into public.account_roles (user_id, role)
select user_id, 'customer'::public.account_role
from public.customer_profiles;

alter table public.account_roles enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.restaurant_employees enable row level security;

create or replace function public.can_manage_employee(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.restaurant_employees re
    join public.restaurants r on r.id = re.restaurant_id
    where re.employee_user_id = target_user_id
      and r.owner_user_id = (select auth.uid())
  );
$$;

create or replace function public.can_access_restaurant(target_restaurant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.restaurants r
    where r.id = target_restaurant_id
      and r.owner_user_id = (select auth.uid())
  ) or exists (
    select 1
    from public.restaurant_employees re
    where re.restaurant_id = target_restaurant_id
      and re.employee_user_id = (select auth.uid())
  );
$$;

revoke all on function public.can_manage_employee(uuid) from public;
revoke all on function public.can_access_restaurant(uuid) from public;
grant execute on function public.can_manage_employee(uuid) to authenticated;
grant execute on function public.can_access_restaurant(uuid) to authenticated;

create policy "Users can read their own account role"
on public.account_roles
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Staff can read permitted staff profiles"
on public.staff_profiles
for select
to authenticated
using (
  (select auth.uid()) = user_id
  or public.can_manage_employee(user_id)
);

create policy "Staff can read their restaurant"
on public.restaurants
for select
to authenticated
using (public.can_access_restaurant(id));

create policy "Staff can read permitted memberships"
on public.restaurant_employees
for select
to authenticated
using (
  (select auth.uid()) = employee_user_id
  or public.can_manage_employee(employee_user_id)
);

create or replace function public.grant_restaurant_employee_access(employee_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_restaurant_id uuid;
  target_employee_id uuid;
begin
  select r.id into owner_restaurant_id
  from public.restaurants r
  join public.account_roles ar on ar.user_id = r.owner_user_id
  where r.owner_user_id = (select auth.uid())
    and ar.role = 'restaurant_owner';

  if owner_restaurant_id is null then
    raise exception 'not_authorized';
  end if;

  select u.id into target_employee_id
  from auth.users u
  join public.account_roles ar on ar.user_id = u.id
  where lower(u.email) = lower(btrim(employee_email))
    and ar.role = 'restaurant_employee';

  if target_employee_id is null
    or exists (
      select 1 from public.restaurant_employees re
      where re.employee_user_id = target_employee_id
    ) then
    raise exception 'employee_unavailable';
  end if;

  insert into public.restaurant_employees (restaurant_id, employee_user_id)
  values (owner_restaurant_id, target_employee_id);
end;
$$;

create or replace function public.revoke_restaurant_employee_access(target_employee_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_count integer;
begin
  delete from public.restaurant_employees re
  using public.restaurants r
  where re.restaurant_id = r.id
    and re.employee_user_id = target_employee_id
    and r.owner_user_id = (select auth.uid());

  get diagnostics deleted_count = row_count;
  if deleted_count = 0 then
    raise exception 'not_authorized';
  end if;
end;
$$;

create or replace function public.list_restaurant_employees()
returns table (
  user_id uuid,
  first_name text,
  last_name text,
  email text
)
language sql
stable
security definer
set search_path = ''
as $$
  select sp.user_id, sp.first_name, sp.last_name, u.email::text
  from public.restaurants r
  join public.restaurant_employees re on re.restaurant_id = r.id
  join public.staff_profiles sp on sp.user_id = re.employee_user_id
  join auth.users u on u.id = re.employee_user_id
  where r.owner_user_id = (select auth.uid())
  order by sp.last_name, sp.first_name, sp.user_id;
$$;

revoke all on function public.grant_restaurant_employee_access(text) from public;
revoke all on function public.revoke_restaurant_employee_access(uuid) from public;
revoke all on function public.list_restaurant_employees() from public;
grant execute on function public.grant_restaurant_employee_access(text) to authenticated;
grant execute on function public.revoke_restaurant_employee_access(uuid) to authenticated;
grant execute on function public.list_restaurant_employees() to authenticated;

drop trigger create_customer_profile_after_signup on auth.users;
drop function public.create_customer_profile();

create or replace function public.create_application_account()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_type text := new.raw_user_meta_data ->> 'account_type';
  account_first_name text := btrim(new.raw_user_meta_data ->> 'first_name');
  account_last_name text := btrim(new.raw_user_meta_data ->> 'last_name');
  restaurant_name text := btrim(new.raw_user_meta_data ->> 'restaurant_name');
begin
  if account_type not in ('customer', 'restaurant_owner', 'restaurant_employee') then
    return new;
  end if;

  if account_first_name is null
    or char_length(account_first_name) not between 1 and 50
    or account_last_name is null
    or char_length(account_last_name) not between 1 and 50 then
    raise exception 'Valid first and last names are required.';
  end if;

  insert into public.account_roles (user_id, role)
  values (new.id, account_type::public.account_role);

  if account_type = 'customer' then
    insert into public.customer_profiles (user_id, first_name, last_name)
    values (new.id, account_first_name, account_last_name);
  else
    insert into public.staff_profiles (user_id, first_name, last_name)
    values (new.id, account_first_name, account_last_name);
  end if;

  if account_type = 'restaurant_owner' then
    if restaurant_name is null or char_length(restaurant_name) not between 2 and 100 then
      raise exception 'A valid restaurant name is required.';
    end if;

    insert into public.restaurants (owner_user_id, name)
    values (new.id, restaurant_name);
  end if;

  return new;
end;
$$;

revoke all on function public.create_application_account() from public;

create trigger create_application_account_after_signup
after insert on auth.users
for each row execute function public.create_application_account();
