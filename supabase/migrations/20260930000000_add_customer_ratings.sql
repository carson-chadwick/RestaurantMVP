create table public.customer_ratings (
  visit_id uuid primary key,
  customer_user_id uuid not null references auth.users (id) on delete cascade,
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  rated_by_staff_user_id uuid not null references auth.users (id) on delete restrict,
  stars smallint not null check (stars between 1 and 5),
  submitted_at timestamptz not null default now(),
  constraint customer_ratings_visit_relationship
    foreign key (visit_id, customer_user_id, restaurant_id)
    references public.paid_visits (id, customer_user_id, restaurant_id)
    on delete cascade
);

create index customer_ratings_customer_idx
on public.customer_ratings (customer_user_id, submitted_at desc);

create index customer_ratings_restaurant_idx
on public.customer_ratings (restaurant_id);

alter table public.customer_ratings enable row level security;
revoke all on table public.customer_ratings from anon, authenticated;

drop function public.list_customers_for_visit(text, text, integer, integer);

create function public.list_customers_for_visit(
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
  average_rating numeric,
  rating_count bigint,
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
  with customer_aggregates as (
    select
      cr.customer_user_id,
      round(avg(cr.stars)::numeric, 1) as average_rating,
      count(*)::bigint as rating_count
    from public.customer_ratings cr
    group by cr.customer_user_id
  )
  select
    cp.user_id,
    cp.first_name,
    cp.last_name,
    u.email::text,
    ca.average_rating,
    coalesce(ca.rating_count, 0)::bigint,
    count(*) over () as total_count
  from public.customer_profiles cp
  join public.account_roles ar on ar.user_id = cp.user_id and ar.role = 'customer'
  join auth.users u on u.id = cp.user_id
  left join customer_aggregates ca on ca.customer_user_id = cp.user_id
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

drop function public.list_staff_recent_visits();

create function public.list_staff_recent_visits()
returns table (
  visit_id uuid,
  customer_user_id uuid,
  customer_first_name text,
  customer_last_name text,
  customer_email text,
  recorded_at timestamptz,
  rating_status text
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
    case
      when rr.visit_id is null then 'awaiting_customer_rating'
      when cr.visit_id is null then 'ready_to_rate_customer'
      else 'customer_rated'
    end
  from public.paid_visits pv
  join public.customer_profiles cp on cp.user_id = pv.customer_user_id
  join auth.users u on u.id = pv.customer_user_id
  left join public.restaurant_ratings rr on rr.visit_id = pv.id
  left join public.customer_ratings cr on cr.visit_id = pv.id
  where pv.restaurant_id = staff_restaurant_id
  order by pv.recorded_at desc, pv.id
  limit 20;
end;
$$;

create function public.list_staff_customer_rating_queue(
  result_limit integer default 20,
  result_offset integer default 0
)
returns table (
  visit_id uuid,
  customer_user_id uuid,
  customer_first_name text,
  customer_last_name text,
  customer_email text,
  recorded_at timestamptz,
  average_rating numeric,
  rating_count bigint,
  total_count bigint
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
  with customer_aggregates as (
    select
      existing.customer_user_id,
      round(avg(existing.stars)::numeric, 1) as average_rating,
      count(*)::bigint as rating_count
    from public.customer_ratings existing
    group by existing.customer_user_id
  )
  select
    pv.id,
    pv.customer_user_id,
    cp.first_name,
    cp.last_name,
    u.email::text,
    pv.recorded_at,
    ca.average_rating,
    coalesce(ca.rating_count, 0)::bigint,
    count(*) over () as total_count
  from public.paid_visits pv
  join public.restaurant_ratings rr on rr.visit_id = pv.id
  join public.customer_profiles cp on cp.user_id = pv.customer_user_id
  join auth.users u on u.id = pv.customer_user_id
  left join public.customer_ratings cr on cr.visit_id = pv.id
  left join customer_aggregates ca on ca.customer_user_id = pv.customer_user_id
  where pv.restaurant_id = staff_restaurant_id
    and cr.visit_id is null
  order by pv.recorded_at desc, pv.id
  limit greatest(1, least(coalesce(result_limit, 20), 50))
  offset greatest(coalesce(result_offset, 0), 0);
end;
$$;

create function public.submit_customer_rating(
  target_visit_id uuid,
  rating_stars integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  staff_restaurant_id uuid := public.current_staff_restaurant_id();
  rated_customer_id uuid;
begin
  if staff_restaurant_id is null then
    raise exception 'not_authorized';
  end if;

  if rating_stars not between 1 and 5 then
    raise exception 'invalid_rating';
  end if;

  insert into public.customer_ratings (
    visit_id,
    customer_user_id,
    restaurant_id,
    rated_by_staff_user_id,
    stars
  )
  select
    pv.id,
    pv.customer_user_id,
    pv.restaurant_id,
    (select auth.uid()),
    rating_stars::smallint
  from public.paid_visits pv
  join public.restaurant_ratings rr on rr.visit_id = pv.id
  where pv.id = target_visit_id
    and pv.restaurant_id = staff_restaurant_id
  returning customer_user_id into rated_customer_id;

  if rated_customer_id is null then
    raise exception 'not_authorized_or_ineligible';
  end if;

  return rated_customer_id;
exception
  when unique_violation then
    raise exception 'rating_already_submitted';
end;
$$;

create function public.get_customer_rating_summary()
returns table (
  average_rating numeric,
  rating_count bigint
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
  select
    round(avg(cr.stars)::numeric, 1),
    count(*)::bigint
  from public.customer_ratings cr
  where cr.customer_user_id = (select auth.uid());
end;
$$;

create function public.list_customer_rating_history()
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
  select
    cr.visit_id,
    cr.restaurant_id,
    r.name,
    pv.recorded_at,
    cr.stars,
    cr.submitted_at
  from public.customer_ratings cr
  join public.paid_visits pv on pv.id = cr.visit_id
  join public.restaurants r on r.id = cr.restaurant_id
  where cr.customer_user_id = (select auth.uid())
  order by cr.submitted_at desc, cr.visit_id
  limit 20;
end;
$$;

revoke all on function public.list_customers_for_visit(text, text, integer, integer) from public;
revoke all on function public.list_staff_recent_visits() from public;
revoke all on function public.list_staff_customer_rating_queue(integer, integer) from public;
revoke all on function public.submit_customer_rating(uuid, integer) from public;
revoke all on function public.get_customer_rating_summary() from public;
revoke all on function public.list_customer_rating_history() from public;

grant execute on function public.list_customers_for_visit(text, text, integer, integer) to authenticated;
grant execute on function public.list_staff_recent_visits() to authenticated;
grant execute on function public.list_staff_customer_rating_queue(integer, integer) to authenticated;
grant execute on function public.submit_customer_rating(uuid, integer) to authenticated;
grant execute on function public.get_customer_rating_summary() to authenticated;
grant execute on function public.list_customer_rating_history() to authenticated;
