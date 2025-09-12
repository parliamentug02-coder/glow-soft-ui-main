-- Add price field to advertisements table
ALTER TABLE public.advertisements 
ADD COLUMN price DECIMAL(12,2) DEFAULT NULL;

-- Add index for better performance on price queries
CREATE INDEX idx_advertisements_price ON public.advertisements(price);

-- Update the create_advertisement function to include price
CREATE OR REPLACE FUNCTION public.create_advertisement(
  p_user_id uuid,
  p_category text,
  p_subcategory text,
  p_title text,
  p_description text,
  p_images text[] DEFAULT '{}',
  p_discord text DEFAULT NULL,
  p_telegram text DEFAULT NULL,
  p_is_vip boolean DEFAULT false,
  p_price decimal DEFAULT NULL
)
RETURNS public.advertisements
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user RECORD;
  v_ad advertisements;
  v_is_vip boolean := coalesce(p_is_vip, false);
BEGIN
  -- Validate user
  SELECT id, role, is_banned INTO v_user
  FROM public.users
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF v_user.is_banned THEN
    RAISE EXCEPTION 'User is banned';
  END IF;

  -- Only VIP/Admin/Moderator can force VIP flag; others will be downgraded
  IF v_is_vip AND v_user.role NOT IN ('vip','admin','moderator') THEN
    v_is_vip := false;
  END IF;

  -- Basic images validation
  IF array_length(p_images, 1) IS NOT NULL AND array_length(p_images, 1) > 10 THEN
    RAISE EXCEPTION 'Too many images (max 10)';
  END IF;

  INSERT INTO public.advertisements (
    user_id, category, subcategory, title, description, images, discord_contact, telegram_contact, is_vip, price
  ) VALUES (
    p_user_id, p_category, p_subcategory, p_title, p_description, coalesce(p_images, '{}'), p_discord, p_telegram, v_is_vip, p_price
  )
  RETURNING * INTO v_ad;

  RETURN v_ad;
END;
$$;

-- Grant execution permission for the updated function
GRANT EXECUTE ON FUNCTION public.create_advertisement(
  uuid, text, text, text, text, text[], text, text, boolean, decimal
) TO anon, authenticated;