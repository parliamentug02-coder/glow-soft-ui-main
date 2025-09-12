-- Create storage bucket for advertisement images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('advertisement-images', 'advertisement-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for advertisement images
CREATE POLICY "Anyone can view advertisement images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'advertisement-images');

CREATE POLICY "Authenticated users can upload advertisement images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'advertisement-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own advertisement images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'advertisement-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own advertisement images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'advertisement-images' 
  AND auth.role() = 'authenticated'
);