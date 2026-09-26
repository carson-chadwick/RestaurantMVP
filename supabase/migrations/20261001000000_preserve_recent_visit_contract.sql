drop function public.list_staff_recent_visits();

create function public.list_staff_recent_visits()
returns table (
  visit_id uuid,
  customer_user_id uuid,
  customer_first_name text,
  customer_last_name text,
  customer_email text,
  recorded_at timestamptz,
  is_rated boolean,
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
    rr.visit_id is not null,
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

revoke all on function public.list_staff_recent_visits() from public;
grant execute on function public.list_staff_recent_visits() to authenticated;
