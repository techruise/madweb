-- Run on a disposable Supabase project or the local PostgreSQL harness.
-- All test data is rolled back. Run after migrations and seed as postgres.
\set ON_ERROR_STOP on
begin;
insert into auth.users(id) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),('cccccccc-cccc-4ccc-8ccc-cccccccccccc');
insert into public.profiles(id,role) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','admin'),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','editor');
insert into public.properties(title,slug,description,area,type,published) values ('TEST private property','test-private-property','Private test content','DHA','sale',false);
insert into public.testimonials(name,text,rating,approved) values ('TEST hidden','Not a real testimonial; test only',5,false),('TEST approved','Not a real testimonial; test only',5,true);
set local role anon;
do $$begin
 if (select count(*) from public.properties where slug='test-private-property')<>0 then raise exception 'Anon saw draft';end if;
 if (select count(*) from public.testimonials where name='TEST hidden')<>0 then raise exception 'Anon saw unapproved testimonial';end if;
 if (select count(*) from public.testimonials where name='TEST approved')<>1 then raise exception 'Approved read failed';end if;
 begin perform * from public.inquiries;raise exception 'Anon read inquiries';exception when insufficient_privilege then null;end;
 begin insert into public.inquiries(name,phone,service,area,message) values ('TEST name','+923001234567','sale','DHA','Test message only');raise exception 'Anon bypassed API';exception when insufficient_privilege then null;end;
 begin perform public.consume_inquiry_limit(repeat('a',64));raise exception 'Anon invoked service RPC';exception when insufficient_privilege then null;end;
end$$;
reset role;
set local role service_role;
do $$declare i integer;allowed boolean;begin
 for i in 1..6 loop select public.consume_inquiry_limit(repeat('a',64)) into allowed;if allowed<>(i<=5) then raise exception 'Rate limit failed at %',i;end if;end loop;
end$$;
insert into public.inquiries(id,name,phone,service,area,message) values ('dddddddd-dddd-4ddd-8ddd-dddddddddddd','TEST name','+923001234567','sale','DHA','Test message only');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-8ccc-cccccccccccc',true);
do $$begin
 if (select count(*) from public.inquiries)<>0 then raise exception 'Nonstaff read inquiries';end if;
 begin insert into public.faqs(question,answer) values ('TEST question','Test answer only');raise exception 'Nonstaff wrote content';exception when insufficient_privilege then null;end;
end$$;
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',true);
do $$begin
 if (select count(*) from public.inquiries where id='dddddddd-dddd-4ddd-8ddd-dddddddddddd')<>1 then raise exception 'Editor cannot read';end if;
 update public.inquiries set status='contacted',notes='Test note' where id='dddddddd-dddd-4ddd-8ddd-dddddddddddd';
 begin update public.inquiries set message='Changed original text';raise exception 'Editor changed original';exception when insufficient_privilege then null;end;
 delete from public.inquiries where id='dddddddd-dddd-4ddd-8ddd-dddddddddddd';
 if (select count(*) from public.inquiries where id='dddddddd-dddd-4ddd-8ddd-dddddddddddd')<>1 then raise exception 'Editor deleted inquiry';end if;
 begin update public.profiles set role='admin' where id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';exception when insufficient_privilege then null;end;
 if public.staff_role()<>'editor' then raise exception 'Editor escalated role';end if;
 insert into public.faqs(question,answer) values ('TEST question','Test answer only');
 insert into storage.objects(bucket_id,name) values ('properties','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb.jpg');
 begin insert into storage.objects(bucket_id,name) values ('properties','unsafe.html');raise exception 'Unsafe name permitted';exception when insufficient_privilege then null;end;
end$$;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
do $$begin
 delete from public.inquiries where id='dddddddd-dddd-4ddd-8ddd-dddddddddddd';
 if (select count(*) from public.inquiries where id='dddddddd-dddd-4ddd-8ddd-dddddddddddd')<>0 then raise exception 'Admin delete failed';end if;
end$$;
rollback;
\echo 'PASS: anon isolation, API-only inquiry inserts, staff roles, immutable inquiry fields, storage names, rate limiting, admin delete'
