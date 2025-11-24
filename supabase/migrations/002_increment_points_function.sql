-- Function to safely increment points (for use in Edge Functions)
CREATE OR REPLACE FUNCTION increment_points(user_id UUID, points INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET total_points = total_points + points
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

