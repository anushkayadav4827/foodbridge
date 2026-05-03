-- Migration: Donor Dashboard & Listing System
-- Adds tables and fields for donor dashboard, listing drafts, and donor statistics

-- ============================================================================
-- EXTEND FOOD_LISTINGS TABLE
-- ============================================================================

-- Add new fields for donor dashboard listing system
ALTER TABLE food_listings
  ADD COLUMN IF NOT EXISTS cover_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS pickup_latitude DECIMAL(10,8),
  ADD COLUMN IF NOT EXISTS pickup_longitude DECIMAL(11,8),
  ADD COLUMN IF NOT EXISTS pickup_instructions TEXT,
  ADD COLUMN IF NOT EXISTS best_before TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS preparation_notes TEXT,
  ADD COLUMN IF NOT EXISTS is_kosher BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_gluten_free BOOLEAN DEFAULT FALSE;

-- Add constraints for coordinates
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_coordinates'
  ) THEN
    ALTER TABLE food_listings
      ADD CONSTRAINT valid_coordinates CHECK (
        (pickup_latitude IS NULL OR (pickup_latitude BETWEEN -90 AND 90)) AND
        (pickup_longitude IS NULL OR (pickup_longitude BETWEEN -180 AND 180))
      );
  END IF;
END $$;

-- Update existing listings to have coordinates from pickup_location
UPDATE food_listings
SET 
  pickup_latitude = ST_Y(pickup_location::geometry),
  pickup_longitude = ST_X(pickup_location::geometry)
WHERE pickup_latitude IS NULL AND pickup_location IS NOT NULL;

-- ============================================================================
-- EXTEND CLAIMS TABLE
-- ============================================================================

-- Add new fields for claim management
ALTER TABLE claims
  ADD COLUMN IF NOT EXISTS message TEXT,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add constraint for unique pending claims per receiver per listing
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_claim 
  ON claims(listing_id, receiver_id) 
  WHERE status = 'pending_accept';

-- ============================================================================
-- DONOR STATS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS donor_stats (
  donor_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  -- Lifetime metrics
  total_meals_donated INTEGER NOT NULL DEFAULT 0,
  total_kg_saved DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_co2_prevented DECIMAL(10,2) NOT NULL DEFAULT 0,
  unique_receivers_helped INTEGER NOT NULL DEFAULT 0,
  
  -- Streaks
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  
  -- Counts
  total_listings INTEGER NOT NULL DEFAULT 0,
  completed_listings INTEGER NOT NULL DEFAULT 0,
  cancelled_listings INTEGER NOT NULL DEFAULT 0,
  
  -- Rating (from ratings table)
  average_rating DECIMAL(3,2) DEFAULT 0,
  
  -- Timestamps
  last_donation_date TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_donor_rating CHECK (average_rating >= 0 AND average_rating <= 5)
);

CREATE INDEX IF NOT EXISTS idx_donor_stats_updated ON donor_stats(updated_at);
CREATE INDEX IF NOT EXISTS idx_donor_stats_streak ON donor_stats(current_streak DESC);

-- ============================================================================
-- LISTING DRAFTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS listing_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Draft data stored as JSONB
  data JSONB NOT NULL,
  
  -- Wizard state
  current_step INTEGER NOT NULL CHECK (current_step BETWEEN 1 AND 5),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  
  -- One draft per donor constraint
  CONSTRAINT one_draft_per_donor UNIQUE (donor_id)
);

CREATE INDEX IF NOT EXISTS idx_drafts_donor ON listing_drafts(donor_id);
CREATE INDEX IF NOT EXISTS idx_drafts_expires ON listing_drafts(expires_at);

-- Add trigger for updated_at
CREATE TRIGGER update_listing_drafts_updated_at 
  BEFORE UPDATE ON listing_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTIONS FOR DONOR STATS
-- ============================================================================

-- Function to initialize donor stats for a new donor
CREATE OR REPLACE FUNCTION initialize_donor_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO donor_stats (donor_id)
  VALUES (NEW.user_id)
  ON CONFLICT (donor_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create donor stats when donor profile is created
CREATE TRIGGER trigger_initialize_donor_stats
  AFTER INSERT ON donor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_donor_stats();

-- Function to update donor stats when listing is completed
CREATE OR REPLACE FUNCTION update_donor_stats_on_listing_complete()
RETURNS TRIGGER AS $$
DECLARE
  meals_count INTEGER;
  kg_saved DECIMAL(10,2);
BEGIN
  -- Only process when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Calculate meals (convert quantity to meals)
    meals_count := CASE 
      WHEN NEW.quantity_unit = 'meals' THEN NEW.quantity_value
      WHEN NEW.quantity_unit = 'kg' THEN (NEW.quantity_value * 4)::INTEGER -- 1 kg ≈ 4 meals
      WHEN NEW.quantity_unit IN ('portions', 'servings', 'plates') THEN NEW.quantity_value
      ELSE NEW.quantity_value
    END;
    
    -- Calculate kg saved
    kg_saved := CASE 
      WHEN NEW.quantity_unit = 'kg' THEN NEW.quantity_value
      WHEN NEW.quantity_unit = 'meals' THEN NEW.quantity_value * 0.25 -- 1 meal ≈ 0.25 kg
      ELSE NEW.quantity_value * 0.25
    END;
    
    -- Update donor stats
    UPDATE donor_stats
    SET 
      total_meals_donated = total_meals_donated + meals_count,
      total_kg_saved = total_kg_saved + kg_saved,
      total_co2_prevented = total_co2_prevented + (meals_count * 2.5), -- 1 meal = 2.5 kg CO2
      completed_listings = completed_listings + 1,
      last_donation_date = NEW.completed_at,
      updated_at = NOW()
    WHERE donor_id = NEW.donor_id;
    
    -- Update unique receivers count
    UPDATE donor_stats ds
    SET unique_receivers_helped = (
      SELECT COUNT(DISTINCT c.receiver_id)
      FROM claims c
      JOIN food_listings fl ON c.listing_id = fl.id
      WHERE fl.donor_id = NEW.donor_id
        AND c.status = 'completed'
    )
    WHERE ds.donor_id = NEW.donor_id;
    
  END IF;
  
  -- Update cancelled count
  IF NEW.status = 'cancelled' AND (OLD.status IS NULL OR OLD.status != 'cancelled') THEN
    UPDATE donor_stats
    SET 
      cancelled_listings = cancelled_listings + 1,
      updated_at = NOW()
    WHERE donor_id = NEW.donor_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update donor stats on listing status change
CREATE TRIGGER trigger_update_donor_stats_on_listing_complete
  AFTER UPDATE OF status ON food_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_donor_stats_on_listing_complete();

-- Function to update total_listings count
CREATE OR REPLACE FUNCTION increment_donor_total_listings()
RETURNS TRIGGER AS $$
BEGIN
  -- Only count listings that move from draft to available
  IF NEW.status = 'available' AND (OLD IS NULL OR OLD.status = 'draft') THEN
    UPDATE donor_stats
    SET 
      total_listings = total_listings + 1,
      updated_at = NOW()
    WHERE donor_id = NEW.donor_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment total listings
CREATE TRIGGER trigger_increment_donor_total_listings
  AFTER INSERT OR UPDATE OF status ON food_listings
  FOR EACH ROW
  EXECUTE FUNCTION increment_donor_total_listings();

-- ============================================================================
-- FUNCTION TO CALCULATE DONOR STREAK
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_donor_streak(p_donor_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_streak INTEGER := 0;
  v_current_date DATE := CURRENT_DATE;
  v_check_date DATE;
  v_has_listing BOOLEAN;
BEGIN
  -- Start from today and go backwards
  v_check_date := v_current_date;
  
  LOOP
    -- Check if donor had any active listing on this date
    SELECT EXISTS(
      SELECT 1 FROM food_listings
      WHERE donor_id = p_donor_id
        AND status IN ('available', 'claimed', 'in_progress', 'completed')
        AND DATE(created_at) <= v_check_date
        AND (
          DATE(pickup_by) >= v_check_date
          OR (completed_at IS NOT NULL AND DATE(completed_at) = v_check_date)
        )
    ) INTO v_has_listing;
    
    -- If no listing on this date, break the streak
    EXIT WHEN NOT v_has_listing;
    
    -- Increment streak and check previous day
    v_streak := v_streak + 1;
    v_check_date := v_check_date - INTERVAL '1 day';
    
    -- Safety limit: don't check more than 365 days
    EXIT WHEN v_streak >= 365;
  END LOOP;
  
  RETURN v_streak;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS FOR DONOR DASHBOARD
-- ============================================================================

-- View for active listings with computed fields
CREATE OR REPLACE VIEW donor_active_listings_view AS
SELECT 
  l.*,
  EXTRACT(EPOCH FROM (l.pickup_by - NOW())) AS time_remaining_seconds,
  CASE 
    WHEN EXTRACT(EPOCH FROM (l.pickup_by - NOW())) < 7200 THEN TRUE 
    ELSE FALSE 
  END AS is_urgent,
  (
    SELECT COUNT(*) 
    FROM claims c 
    WHERE c.listing_id = l.id 
      AND c.status = 'pending_accept'
  ) AS pending_claims_count
FROM food_listings l
WHERE l.status IN ('available', 'claimed', 'in_progress')
  AND l.pickup_by > NOW();

-- View for pending claims with receiver details
CREATE OR REPLACE VIEW donor_pending_claims_view AS
SELECT 
  c.*,
  u.full_name AS receiver_name,
  u.profile_photo_url AS receiver_photo,
  rp.average_rating AS receiver_rating,
  rp.receiver_type,
  COALESCE(rp.total_claims, 0) AS receiver_completed_pickups,
  EXTRACT(EPOCH FROM (NOW() - c.claimed_at)) AS seconds_since_claimed,
  EXTRACT(EPOCH FROM (INTERVAL '15 minutes' - (NOW() - c.claimed_at))) AS seconds_remaining,
  CASE 
    WHEN (NOW() - c.claimed_at) > INTERVAL '15 minutes' THEN TRUE 
    ELSE FALSE 
  END AS is_expired,
  fl.donor_id,
  fl.title AS listing_title
FROM claims c
JOIN food_listings fl ON c.listing_id = fl.id
JOIN users u ON c.receiver_id = u.id
LEFT JOIN receiver_profiles rp ON u.id = rp.user_id
WHERE c.status = 'pending_accept';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Additional indexes for donor dashboard queries
CREATE INDEX IF NOT EXISTS idx_listings_donor_status ON food_listings(donor_id, status);
CREATE INDEX IF NOT EXISTS idx_listings_status_pickup_by ON food_listings(status, pickup_by);
CREATE INDEX IF NOT EXISTS idx_claims_listing_status ON claims(listing_id, status);
CREATE INDEX IF NOT EXISTS idx_claims_status_claimed_at ON claims(status, claimed_at);

-- ============================================================================
-- MIGRATE EXISTING DATA
-- ============================================================================

-- Initialize donor_stats for existing donors
INSERT INTO donor_stats (donor_id)
SELECT DISTINCT user_id 
FROM donor_profiles
ON CONFLICT (donor_id) DO NOTHING;

-- Recalculate stats for existing donors with completed listings
DO $$
DECLARE
  donor_record RECORD;
  listing_id_to_update UUID;
BEGIN
  FOR donor_record IN 
    SELECT DISTINCT donor_id FROM food_listings WHERE status = 'completed'
  LOOP
    -- Get one listing ID for this donor
    SELECT id INTO listing_id_to_update
    FROM food_listings
    WHERE donor_id = donor_record.donor_id 
      AND status = 'completed'
    LIMIT 1;
    
    -- Trigger the stats calculation by updating the listing
    IF listing_id_to_update IS NOT NULL THEN
      UPDATE food_listings 
      SET updated_at = NOW() 
      WHERE id = listing_id_to_update;
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE donor_stats IS 'Aggregated statistics for donor dashboard';
COMMENT ON TABLE listing_drafts IS 'Temporary storage for incomplete listing wizard data';
COMMENT ON FUNCTION calculate_donor_streak IS 'Calculates consecutive days with active listings';
COMMENT ON VIEW donor_active_listings_view IS 'Active listings with computed time remaining and urgency';
COMMENT ON VIEW donor_pending_claims_view IS 'Pending claims with receiver details and timeout info';

