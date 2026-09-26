alter table public.customer_profiles
add column identity_disclosure_acknowledged_at timestamptz;

update public.customer_profiles
set identity_disclosure_acknowledged_at = created_at
where identity_disclosure_acknowledged_at is null;

alter table public.customer_profiles
alter column identity_disclosure_acknowledged_at set not null;

create table public.paid_visits (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  customer_user_id uuid not null references auth.users (id) on delete cascade,
  recorded_by_staff_user_id uuid not null references auth.users (id) on delete restrict,
  recorded_at timestamptz not null default now(),
  unique (id, customer_user_id, restaurant_id)
);

create table public.restaurant_ratings (
  visit_id uuid primary key,
  customer_user_id uuid not null references auth.users (id) on delete cascade,
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  submitted_at timestamptz not null default now(),
  constraint restaurant_ratings_visit_relationship
    foreign key (visit_id, customer_user_id, restaurant_id)
    references public.paid_visits (id, customer_user_id, restaurant_id)
    on delete cascade
);

create index paid_visits_customer_recent_idx
on public.paid_visits (customer_user_id, recorded_at desc);

create index paid_visits_restaurant_recent_idx
on public.paid_visits (restaurant_id, recorded_at desc);

create index restaurant_ratings_restaurant_idx
on public.restaurant_ratings (restaurant_id);

alter table public.paid_visits enable row level security;
alter table public.restaurant_ratings enable row level security;

create or replace function public.current_staff_restaurant_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select r.id
      from public.restaurants r
      join public.account_roles ar on ar.user_id = r.owner_user_id
      where r.owner_user_id = (select auth.uid())
        and ar.role = 'restaurant_owner'
    ),
    (
      select re.restaurant_id
      from public.restaurant_employees re
      join public.account_roles ar on ar.user_id = re.employee_user_id
      where re.employee_user_id = (select auth.uid())
        and ar.role = 'restaurant_employee'
    )
  );
$$;

create or replace function public.list_customers_for_visit(
  search_first_name text default null,
  search_last_name text default null,
  result_limit integer default 20,
  result_offset integer default 0
)
returns table (
  user_id uuid,
  first_name text,
  last_name text,
  email text,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if public.current_staff_restaurant_id() is null then
    raise exception 'not_authorized';
  end if;

  if (nullif(btrim(search_first_name), '') is null)
    <> (nullif(btrim(search_last_name), '') is null) then
    raise exception 'invalid_search';
  end if;

  return query
  select
    cp.user_id,
    cp.first_name,
    cp.last_name,
    u.email::text,
    count(*) over () as total_count
  from public.customer_profiles cp
  join public.account_roles ar on ar.user_id = cp.user_id and ar.role = 'customer'
  join auth.users u on u.id = cp.user_id
  where cp.identity_disclosure_acknowledged_at is not null
    and (
      nullif(btrim(search_first_name), '') is null
      or (
        lower(cp.first_name) = lower(btrim(search_first_name))
        and lower(cp.last_name) = lower(btrim(search_last_name))
      )
    )
  order by cp.created_at desc, cp.user_id
  limit greatest(1, least(coalesce(result_limit, 20), 50))
  offset greatest(coalesce(result_offset, 0), 0);
end;
$$;

create or replace function public.record_paid_visit(target_customer_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  staff_restaurant_id uuid := public.current_staff_restaurant_id();
  created_visit_id uuid;
begin
  if staff_restaurant_id is null then
    raise exception 'not_authorized';
  end if;

  if not exists (
    select 1
    from public.customer_profiles cp
    join public.account_roles ar on ar.user_id = cp.user_id
    where cp.user_id = target_customer_user_id
      and cp.identity_disclosure_acknowledged_at is not null
      and ar.role = 'customer'
  ) then
    raise exception 'customer_unavailable';
  end if;

  insert into public.paid_visits (
    restaurant_id,
    customer_user_id,
    recorded_by_staff_user_id
  ) values (
    staff_restaurant_id,
    target_customer_user_id,
    (select auth.uid())
  )
  returning id into created_visit_id;

  return created_visit_id;
end;
$$;

create or replace function public.list_staff_recent_visits()
returns table (
  visit_id uuid,
  customer_user_id uuid,
  customer_first_name text,
  customer_last_name text,
  customer_email text,
  recorded_at timestamptz,
  is_rated boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  staff_restaurant_id uuid := public.current_staff_restaurant_id();
begin
  if staff_restaurant_id is null then
    raise exception 'not_authorized';
  end if;

  return query
  select
    pv.id,
    pv.customer_user_id,
    cp.first_name,
    cp.last_name,
    u.email::text,
    pv.recorded_at,
    rr.visit_id is not null
  from public.paid_visits pv
  join public.customer_profiles cp on cp.user_id = pv.customer_user_id
  join auth.users u on u.id = pv.customer_user_id
  left join public.restaurant_ratings rr on rr.visit_id = pv.id
  where pv.restaurant_id = staff_restaurant_id
  order by pv.recorded_at desc, pv.id
  limit 20;
end;
$$;

create or replace function public.list_customer_restaurant_visits()
returns table (
  visit_id uuid,
  restaurant_id uuid,
  restaurant_name text,
  recorded_at timestamptz,
  stars smallint,
  submitted_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.account_roles ar
    where ar.user_id = (select auth.uid())
      and ar.role = 'customer'
  ) then
    raise exception 'not_authorized';
  end if;

  return query
  with customer_visits as (
    select
      pv.id as visit_id,
      pv.restaurant_id,
      r.name as restaurant_name,
      pv.recorded_at,
      rr.stars,
      rr.submitted_at,
      row_number() over (
        partition by (rr.visit_id is not null)
        order by pv.recorded_at desc, pv.id
      ) as status_row
    from public.paid_visits pv
    join public.restaurants r on r.id = pv.restaurant_id
    left join public.restaurant_ratings rr on rr.visit_id = pv.id
    where pv.customer_user_id = (select auth.uid())
  )
  select
    cv.visit_id,
    cv.restaurant_id,
    cv.restaurant_name,
    cv.recorded_at,
    cv.stars,
    cv.submitted_at
  from customer_visits cv
  where cv.stars is null or cv.status_row <= 20
  order by (cv.stars is not null), cv.recorded_at desc, cv.visit_id;
end;
$$;

create or replace function public.submit_restaurant_rating(
  target_visit_id uuid,
  rating_stars integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  rated_restaurant_id uuid;
begin
  if rating_stars not between 1 and 5 then
    raise exception 'invalid_rating';
  end if;

  insert into public.restaurant_ratings (
    visit_id,
    customer_user_id,
    restaurant_id,
    stars
  )
  select
    pv.id,
    pv.customer_user_id,
    pv.restaurant_id,
    rating_stars::smallint
  from public.paid_visits pv
  join public.account_roles ar on ar.user_id = pv.customer_user_id
  where pv.id = target_visit_id
    and pv.customer_user_id = (select auth.uid())
    and ar.role = 'customer'
  returning restaurant_id into rated_restaurant_id;

  if rated_restaurant_id is null then
    raise exception 'not_authorized';
  end if;

  return rated_restaurant_id;
exception
  when unique_violation then
    raise exception 'rating_already_submitted';
end;
$$;

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

  if account_type = 'customer'
    and coalesce((new.raw_user_meta_data ->> 'identity_disclosure_acknowledged')::boolean, false) is not true then
    raise exception 'Customer privacy acknowledgement is required.';
  end if;

  insert into public.account_roles (user_id, role)
  values (new.id, account_type::public.account_role);

  if account_type = 'customer' then
    insert into public.customer_profiles (
      user_id,
      first_name,
      last_name,
      identity_disclosure_acknowledged_at
    ) values (
      new.id,
      account_first_name,
      account_last_name,
      now()
    );
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

create or replace function public.list_public_restaurants(
  search_text text default null,
  result_limit integer default 12,
  result_offset integer default 0
)
returns table (
  id uuid,
  name text,
  address text,
  phone text,
  description text,
  weekly_hours jsonb,
  average_rating numeric,
  rating_count bigint,
  total_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  with rating_aggregates as (
    select
      rr.restaurant_id,
      round(avg(rr.stars)::numeric, 1) as average_rating,
      count(*) as rating_count
    from public.restaurant_ratings rr
    group by rr.restaurant_id
  )
  select
    r.id,
    r.name,
    r.address,
    r.phone,
    r.description,
    r.weekly_hours,
    ra.average_rating,
    coalesce(ra.rating_count, 0)::bigint,
    count(*) over () as total_count
  from public.restaurants r
  left join rating_aggregates ra on ra.restaurant_id = r.id
  where strpos(
    lower(r.name),
    lower(left(btrim(coalesce(search_text, '')), 100))
  ) > 0
  order by lower(r.name), r.id
  limit greatest(1, least(coalesce(result_limit, 12), 50))
  offset greatest(coalesce(result_offset, 0), 0);
$$;

create or replace function public.get_public_restaurant(target_restaurant_id uuid)
returns table (
  id uuid,
  name text,
  address text,
  phone text,
  description text,
  weekly_hours jsonb,
  average_rating numeric,
  rating_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    r.id,
    r.name,
    r.address,
    r.phone,
    r.description,
    r.weekly_hours,
    round(avg(rr.stars)::numeric, 1),
    count(rr.visit_id)::bigint
  from public.restaurants r
  left join public.restaurant_ratings rr on rr.restaurant_id = r.id
  where r.id = target_restaurant_id
  group by r.id;
$$;

revoke all on function public.current_staff_restaurant_id() from public;
revoke all on function public.list_customers_for_visit(text, text, integer, integer) from public;
revoke all on function public.record_paid_visit(uuid) from public;
revoke all on function public.list_staff_recent_visits() from public;
revoke all on function public.list_customer_restaurant_visits() from public;
revoke all on function public.submit_restaurant_rating(uuid, integer) from public;

grant execute on function public.current_staff_restaurant_id() to authenticated;
grant execute on function public.list_customers_for_visit(text, text, integer, integer) to authenticated;
grant execute on function public.record_paid_visit(uuid) to authenticated;
grant execute on function public.list_staff_recent_visits() to authenticated;
grant execute on function public.list_customer_restaurant_visits() to authenticated;
grant execute on function public.submit_restaurant_rating(uuid, integer) to authenticated;
