alter table public.restaurant_ratings
add column review_text text,
add column updated_at timestamptz not null default now(),
add constraint restaurant_ratings_review_text_length
  check (review_text is null or char_length(review_text) between 1 and 1000),
add constraint restaurant_ratings_review_text_trimmed
  check (review_text is null or review_text = btrim(review_text));

create trigger set_restaurant_ratings_updated_at
before update on public.restaurant_ratings
for each row execute function public.set_updated_at();

drop function public.list_customer_restaurant_visits();

create function public.list_customer_restaurant_visits()
returns table (
  visit_id uuid,
  restaurant_id uuid,
  restaurant_name text,
  recorded_at timestamptz,
  stars smallint,
  review_text text,
  submitted_at timestamptz,
  updated_at timestamptz
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
      rr.review_text,
      rr.submitted_at,
      rr.updated_at,
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
    cv.review_text,
    cv.submitted_at,
    cv.updated_at
  from customer_visits cv
  where cv.stars is null or cv.status_row <= 20
  order by (cv.stars is not null), cv.recorded_at desc, cv.visit_id;
end;
$$;

drop function public.submit_restaurant_rating(uuid, integer);

create function public.submit_restaurant_rating(
  target_visit_id uuid,
  rating_stars integer,
  rating_review_text text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  rated_restaurant_id uuid;
  normalized_review_text text := nullif(btrim(coalesce(rating_review_text, '')), '');
begin
  if rating_stars not between 1 and 5 then
    raise exception 'invalid_rating';
  end if;

  if normalized_review_text is not null and char_length(normalized_review_text) > 1000 then
    raise exception 'review_too_long';
  end if;

  insert into public.restaurant_ratings (
    visit_id,
    customer_user_id,
    restaurant_id,
    stars,
    review_text
  )
  select
    pv.id,
    pv.customer_user_id,
    pv.restaurant_id,
    rating_stars::smallint,
    normalized_review_text
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

create function public.update_restaurant_review(
  target_visit_id uuid,
  rating_stars integer,
  rating_review_text text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  rated_restaurant_id uuid;
  normalized_review_text text := nullif(btrim(coalesce(rating_review_text, '')), '');
begin
  if rating_stars not between 1 and 5 then
    raise exception 'invalid_rating';
  end if;

  if normalized_review_text is not null and char_length(normalized_review_text) > 1000 then
    raise exception 'review_too_long';
  end if;

  update public.restaurant_ratings rr
  set stars = rating_stars::smallint,
      review_text = normalized_review_text
  where rr.visit_id = target_visit_id
    and rr.customer_user_id = (select auth.uid())
  returning rr.restaurant_id into rated_restaurant_id;

  if rated_restaurant_id is null then
    raise exception 'not_authorized';
  end if;

  return rated_restaurant_id;
end;
$$;

create function public.delete_restaurant_review(target_visit_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  rated_restaurant_id uuid;
begin
  delete from public.restaurant_ratings rr
  where rr.visit_id = target_visit_id
    and rr.customer_user_id = (select auth.uid())
  returning rr.restaurant_id into rated_restaurant_id;

  if rated_restaurant_id is null then
    raise exception 'not_authorized';
  end if;

  return rated_restaurant_id;
end;
$$;

create function public.get_customer_contribution_count()
returns bigint
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

  return (
    select count(*)::bigint
    from public.restaurant_ratings rr
    where rr.customer_user_id = (select auth.uid())
  );
end;
$$;

create function public.list_public_restaurant_reviews(
  target_restaurant_id uuid,
  result_limit integer default 10,
  result_offset integer default 0
)
returns table (
  stars smallint,
  review_text text,
  submitted_at timestamptz,
  updated_at timestamptz,
  total_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    rr.stars,
    rr.review_text,
    rr.submitted_at,
    rr.updated_at,
    count(*) over () as total_count
  from public.restaurant_ratings rr
  where rr.restaurant_id = target_restaurant_id
  order by rr.submitted_at desc, rr.visit_id
  limit greatest(1, least(coalesce(result_limit, 10), 50))
  offset greatest(coalesce(result_offset, 0), 0);
$$;

revoke all on function public.list_customer_restaurant_visits() from public;
revoke all on function public.submit_restaurant_rating(uuid, integer, text) from public;
revoke all on function public.update_restaurant_review(uuid, integer, text) from public;
revoke all on function public.delete_restaurant_review(uuid) from public;
revoke all on function public.get_customer_contribution_count() from public;
revoke all on function public.list_public_restaurant_reviews(uuid, integer, integer) from public;

grant execute on function public.list_customer_restaurant_visits() to authenticated;
grant execute on function public.submit_restaurant_rating(uuid, integer, text) to authenticated;
grant execute on function public.update_restaurant_review(uuid, integer, text) to authenticated;
grant execute on function public.delete_restaurant_review(uuid) to authenticated;
grant execute on function public.get_customer_contribution_count() to authenticated;
grant execute on function public.list_public_restaurant_reviews(uuid, integer, integer) to anon, authenticated;
