-- Check all triggers that might be calling distribute_referral_points
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%referral%' OR trigger_name LIKE '%point%' OR trigger_name LIKE '%new_user%'
ORDER BY trigger_name;
