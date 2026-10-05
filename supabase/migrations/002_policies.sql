begin;
-- SECURITY DEFINER avoids recursive profile policies. No user-supplied role claims.
create or replace function public.staff_role() returns text language sql stable security definer set search_path='' as $$select role from public.profiles where id=(select auth.uid())$$;
revoke all on function public.staff_role() from public;
grant execute on function public.staff_role() to anon,authenticated;
do $$ declare t text; begin
 foreach t in array array['profiles','properties','projects','property_images','project_images','testimonials','inquiries','faqs','inquiry_rate_limits'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon,authenticated',t);
 end loop;
end $$;
grant select on public.properties,public.projects,public.property_images,public.project_images,public.testimonials,public.faqs to anon,authenticated;
grant select,insert,update,delete on public.profiles,public.properties,public.projects,public.property_images,public.project_images,public.testimonials,public.faqs to authenticated;
grant select,delete on public.inquiries to authenticated;
-- Staff may update workflow fields, never replace original enquiry/consent details.
grant update(status,notes) on public.inquiries to authenticated;
grant all on public.profiles,public.properties,public.projects,public.property_images,public.project_images,public.testimonials,public.inquiries,public.faqs,public.inquiry_rate_limits to service_role;
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated using(id=(select auth.uid()) or (select public.staff_role())='admin');
drop policy if exists profiles_admin_insert on public.profiles;
create policy profiles_admin_insert on public.profiles for insert to authenticated with check((select public.staff_role())='admin');
drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles for update to authenticated using((select public.staff_role())='admin') with check((select public.staff_role())='admin');
drop policy if exists profiles_admin_delete on public.profiles;
create policy profiles_admin_delete on public.profiles for delete to authenticated using((select public.staff_role())='admin');
do $$ declare t text; begin
 foreach t in array array['properties','projects','testimonials','faqs'] loop
  execute format('drop policy if exists public_read on public.%I',t);
  execute format('create policy public_read on public.%I for select to anon,authenticated using (%I=true)',t,case when t='testimonials' then 'approved' else 'published' end);
 end loop;
 foreach t in array array['properties','projects','property_images','project_images','testimonials','faqs'] loop
  execute format('drop policy if exists staff_read on public.%I',t);
  execute format('create policy staff_read on public.%I for select to authenticated using ((select public.staff_role()) in (''admin'',''editor''))',t);
  execute format('drop policy if exists staff_insert on public.%I',t);
  execute format('create policy staff_insert on public.%I for insert to authenticated with check ((select public.staff_role()) in (''admin'',''editor''))',t);
  execute format('drop policy if exists staff_update on public.%I',t);
  execute format('create policy staff_update on public.%I for update to authenticated using ((select public.staff_role()) in (''admin'',''editor'')) with check ((select public.staff_role()) in (''admin'',''editor''))',t);
  execute format('drop policy if exists staff_delete on public.%I',t);
  execute format('create policy staff_delete on public.%I for delete to authenticated using ((select public.staff_role()) in (''admin'',''editor''))',t);
 end loop;
end $$;
drop policy if exists published_parent on public.property_images;
create policy published_parent on public.property_images for select to anon,authenticated using(exists(select 1 from public.properties p where p.id=property_id and p.published));
drop policy if exists published_parent on public.project_images;
create policy published_parent on public.project_images for select to anon,authenticated using(exists(select 1 from public.projects p where p.id=project_id and p.published));
drop policy if exists inquiries_staff_read on public.inquiries;
create policy inquiries_staff_read on public.inquiries for select to authenticated using((select public.staff_role()) in ('admin','editor'));
drop policy if exists inquiries_staff_update on public.inquiries;
create policy inquiries_staff_update on public.inquiries for update to authenticated using((select public.staff_role()) in ('admin','editor')) with check((select public.staff_role()) in ('admin','editor'));
drop policy if exists inquiries_admin_delete on public.inquiries;
create policy inquiries_admin_delete on public.inquiries for delete to authenticated using((select public.staff_role())='admin');
-- Intentionally NO anon insert/read policy for inquiries. Public submission is via
-- /api/inquiries, whose service-only client inserts after validation/rate limiting.
-- Granting anon INSERT would allow bypassing the API's abuse controls.
create or replace function public.consume_inquiry_limit(p_key text) returns boolean language plpgsql security definer set search_path='' as $$
declare n integer;begin
 if length(p_key)<>64 then return false;end if;
 delete from public.inquiry_rate_limits where window_start<now()-interval '1 day';
 insert into public.inquiry_rate_limits(key_hash,window_start,hits) values(p_key,now(),1)
 on conflict(key_hash) do update set
 hits=case when public.inquiry_rate_limits.window_start<now()-interval '15 minutes' then 1 else public.inquiry_rate_limits.hits+1 end,
 window_start=case when public.inquiry_rate_limits.window_start<now()-interval '15 minutes' then now() else public.inquiry_rate_limits.window_start end
 returning hits into n;
 return n<=5;
end$$;
revoke all on function public.consume_inquiry_limit(text) from public,anon,authenticated;
grant execute on function public.consume_inquiry_limit(text) to service_role;
commit;
