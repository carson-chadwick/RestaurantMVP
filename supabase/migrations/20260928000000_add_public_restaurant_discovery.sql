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
  select
    r.id,
    r.name,
    r.address,
    r.phone,
    r.description,
    r.weekly_hours,
    null::numeric as average_rating,
    0::bigint as rating_count,
    count(*) over () as total_count
  from public.restaurants r
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
    null::numeric as average_rating,
    0::bigint as rating_count
  from public.restaurants r
  where r.id = target_restaurant_id;
$$;

revoke all on function public.list_public_restaurants(text, integer, integer) from public;
revoke all on function public.get_public_restaurant(uuid) from public;

grant execute on function public.list_public_restaurants(text, integer, integer)
to anon, authenticated;
grant execute on function public.get_public_restaurant(uuid)
to anon, authenticated;
