-- Demonstration records only. Never seed invented testimonials or users.
-- Remove these before launch. No photos are presented as real.
insert into public.properties(id,title,slug,description,area,type,price,size,size_unit,status,published,is_sample)
values ('11111111-1111-4111-8111-111111111111','SAMPLE — Johar Town property','sample-johar-town-property','SAMPLE data for testing the website. This is not an actual property offered for sale. Price, dimensions and rooms must be supplied for real listings.','Johar Town','sale',null,null,'marla','for sale',true,true)
on conflict(id) do nothing;
insert into public.projects(id,title,slug,description,area,scope,year,status,published,is_sample)
values ('22222222-2222-4222-8222-222222222222','SAMPLE — Construction portfolio','sample-construction-portfolio','SAMPLE portfolio entry for testing. This is not an actual MAD construction project. Upload approved before and after photos and verified project details.','Johar Town','grey structure',null,'ongoing',true,true)
on conflict(id) do nothing;
