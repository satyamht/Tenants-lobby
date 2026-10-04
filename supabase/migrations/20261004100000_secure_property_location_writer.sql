drop function if exists public.set_property_exact_location(uuid,double precision,double precision,text,double precision,text);

create or replace function public.set_property_exact_location(
  p_property_id uuid,
  p_latitude double precision,
  p_longitude double precision,
  p_exact_address text,
  p_gps_accuracy_m double precision default null,
  p_verification_session_id uuid default null
)
returns void
language plpgsql
security definer
set search_path=''
as $$
begin
  if p_latitude < -90 or p_latitude > 90 or p_longitude < -180 or p_longitude > 180 then
    raise exception 'invalid coordinates';
  end if;

  if coalesce(length(trim(p_exact_address)), 0) = 0 then
    raise exception 'invalid exact address';
  end if;

  insert into public.property_locations (
    property_id,
    exact_point,
    exact_address,
    gps_accuracy_m,
    verification_timestamp,
    verification_session_id
  )
  values (
    p_property_id,
    public.st_setsrid(public.st_makepoint(p_longitude, p_latitude), 4326)::public.geography,
    trim(p_exact_address),
    p_gps_accuracy_m,
    now(),
    p_verification_session_id
  )
  on conflict (property_id) do update set
    exact_point = excluded.exact_point,
    exact_address = excluded.exact_address,
    gps_accuracy_m = excluded.gps_accuracy_m,
    verification_timestamp = excluded.verification_timestamp,
    verification_session_id = excluded.verification_session_id,
    updated_at = now();
end;
$$;

revoke execute on function public.set_property_exact_location(uuid,double precision,double precision,text,double precision,uuid) from public, anon, authenticated;
grant execute on function public.set_property_exact_location(uuid,double precision,double precision,text,double precision,uuid) to service_role;
