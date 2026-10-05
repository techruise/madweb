begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('properties','properties',true,5242880,array['image/jpeg','image/png','image/webp']),
 ('projects','projects',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists mad_images_read on storage.objects;
create policy mad_images_read on storage.objects for select to anon,authenticated using(bucket_id in ('properties','projects'));
drop policy if exists mad_images_insert on storage.objects;
create policy mad_images_insert on storage.objects for insert to authenticated with check(bucket_id in ('properties','projects') and (select public.staff_role()) in ('admin','editor') and name ~ '^[a-f0-9-]+/[a-f0-9-]+\.(jpg|png|webp)$');
drop policy if exists mad_images_update on storage.objects;
create policy mad_images_update on storage.objects for update to authenticated using(bucket_id in ('properties','projects') and (select public.staff_role()) in ('admin','editor')) with check(bucket_id in ('properties','projects') and (select public.staff_role()) in ('admin','editor') and name ~ '^[a-f0-9-]+/[a-f0-9-]+\.(jpg|png|webp)$');
drop policy if exists mad_images_delete on storage.objects;
create policy mad_images_delete on storage.objects for delete to authenticated using(bucket_id in ('properties','projects') and (select public.staff_role()) in ('admin','editor'));
commit;
