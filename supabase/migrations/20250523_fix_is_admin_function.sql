
-- Fix the is_admin function with a fixed search path
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Check if the current user's email is in the admin list
  RETURN (
    SELECT email IN ('admin@example.com', 'myles@sparkflare.com.au')
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$function$;
