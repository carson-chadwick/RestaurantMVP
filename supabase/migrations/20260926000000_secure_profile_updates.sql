create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public;

create trigger set_customer_profiles_updated_at
before update on public.customer_profiles
for each row execute function public.set_updated_at();

create trigger set_staff_profiles_updated_at
before update on public.staff_profiles
for each row execute function public.set_updated_at();

create trigger set_restaurants_updated_at
before update on public.restaurants
for each row execute function public.set_updated_at();

create policy "Customers can update their own profile"
on public.customer_profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Staff can update their own profile"
on public.staff_profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Owners can update their own restaurant"
on public.restaurants
for update
to authenticated
using ((select auth.uid()) = owner_user_id)
with check ((select auth.uid()) = owner_user_id);

revoke update on public.customer_profiles from authenticated;
revoke update on public.staff_profiles from authenticated;
revoke update on public.restaurants from authenticated;

grant update (first_name, last_name) on public.customer_profiles to authenticated;
grant update (first_name, last_name) on public.staff_profiles to authenticated;
grant update (name) on public.restaurants to authenticated;
