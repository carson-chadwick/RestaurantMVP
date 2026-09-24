create or replace function public.is_valid_weekly_hours(value jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select
    jsonb_typeof(value) = 'object'
    and value ?& array[
      'monday', 'tuesday', 'wednesday', 'thursday',
      'friday', 'saturday', 'sunday'
    ]
    and (select count(*) from jsonb_object_keys(value)) = 7
    and not exists (
      select 1
      from jsonb_each(value) as day_hours(day_name, hours)
      where
        day_name not in (
          'monday', 'tuesday', 'wednesday', 'thursday',
          'friday', 'saturday', 'sunday'
        )
        or jsonb_typeof(hours) <> 'object'
        or not (
          (
            hours = '{"closed": true}'::jsonb
          )
          or (
            (select count(*) from jsonb_object_keys(hours)) = 2
            and hours ?& array['open', 'close']
            and (hours ->> 'open') ~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$'
            and (hours ->> 'close') ~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$'
            and (hours ->> 'close') > (hours ->> 'open')
          )
        )
    );
$$;

revoke all on function public.is_valid_weekly_hours(jsonb) from public;

alter table public.restaurants
add column address text,
add column phone text,
add column description text,
add column weekly_hours jsonb,
add constraint restaurants_address_length
  check (
    address is null
    or (char_length(address) between 1 and 300 and address = btrim(address))
  ),
add constraint restaurants_phone_length
  check (
    phone is null
    or (char_length(phone) between 7 and 25 and phone = btrim(phone))
  ),
add constraint restaurants_description_length
  check (
    description is null
    or (char_length(description) between 1 and 500 and description = btrim(description))
  ),
add constraint restaurants_weekly_hours_shape
  check (weekly_hours is null or public.is_valid_weekly_hours(weekly_hours));

revoke update on public.restaurants from authenticated;
grant update (name, address, phone, description, weekly_hours)
on public.restaurants to authenticated;
