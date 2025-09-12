-- Storage RLS policies for advertisement-images bucket
-- Allow public read of files in the 'advertisement-images' bucket
create policy if not exists "Public can read advertisement images"
  on storage.objects
  for select
  using (bucket_id = 'advertisement-images');

-- Allow users (based on app.current_user_id) to upload into their own folder: <user_id>/filename
create policy if not exists "Users can upload to own folder in advertisement-images"
  on storage.objects
  for insert
  with check (
    bucket_id = 'advertisement-images'
    and current_setting('app.current_user_id', true) is not null
    and (storage.foldername(name))[1] = current_setting('app.current_user_id', true)
  );

-- Allow users to update their own files in the 'advertisement-images' bucket
create policy if not exists "Users can update own files in advertisement-images"
  on storage.objects
  for update
  using (
    bucket_id = 'advertisement-images'
    and (storage.foldername(name))[1] = current_setting('app.current_user_id', true)
  )
  with check (
    bucket_id = 'advertisement-images'
    and (storage.foldername(name))[1] = current_setting('app.current_user_id', true)
  );

-- Allow users to delete their own files in the 'advertisement-images' bucket
create policy if not exists "Users can delete own files in advertisement-images"
  on storage.objects
  for delete
  using (
    bucket_id = 'advertisement-images'
    and (storage.foldername(name))[1] = current_setting('app.current_user_id', true)
  );

-- Allow admins and moderators to manage all files in 'advertisement-images'
create policy if not exists "Admins and moderators can manage all files in advertisement-images"
  on storage.objects
  for all
  using (
    bucket_id = 'advertisement-images'
    and exists (
      select 1 from public.users u
      where (u.id)::text = current_setting('app.current_user_id', true)
        and u.role in ('admin','moderator')
    )
  )
  with check (
    bucket_id = 'advertisement-images'
    and exists (
      select 1 from public.users u
      where (u.id)::text = current_setting('app.current_user_id', true)
        and u.role in ('admin','moderator')
    )
  );