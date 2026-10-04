drop policy if exists properties_owner_select on public.properties;
drop policy if exists properties_public_select on public.properties;

create policy properties_anon_select
on public.properties for select to anon
using (
  verification_status = 'VERIFIED'
  and listing_status in ('ACTIVE','EXPIRING')
);

create policy properties_authenticated_select
on public.properties for select to authenticated
using (
  owner_id = (select auth.uid())
  or (
    verification_status = 'VERIFIED'
    and listing_status in ('ACTIVE','EXPIRING')
  )
);

revoke execute on function public.st_estimatedextent(text,text) from anon, authenticated;
revoke execute on function public.st_estimatedextent(text,text,text) from anon, authenticated;
revoke execute on function public.st_estimatedextent(text,text,text,boolean) from anon, authenticated;
