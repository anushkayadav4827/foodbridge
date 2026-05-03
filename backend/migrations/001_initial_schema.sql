-- FoodBridge Database Schema
-- PostgreSQL 15+ with PostGIS extension

-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('donor', 'receiver', 'volunteer', 'admin');
CREATE TYPE donor_type AS ENUM ('restaurant', 'supermarket', 'catering', 'household', 'corporate', 'event_venue');
CREATE TYPE receiver_type AS ENUM ('individual', 'family', 'ngo', 'shelter', 'community_kitchen', 'school', 'orphanage');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
CREATE TYPE verification_tier AS ENUM ('tier0_phone', 'tier1_community', 'tier2_document', 'tier3_trusted');

CREATE TYPE food_type AS ENUM (
  'cooked_hot',
  'cooked_cold',
  'raw_vegetables',
  'raw_meat',
  'packaged',
  'bakery',
  'dairy',
  'beverages',
  'sweets',
  'dry_goods'
);

CREATE TYPE dietary_info AS ENUM ('vegetarian', 'vegan', 'halal', 'non_vegetarian');
CREATE TYPE allergen AS ENUM ('nuts', 'gluten', 'dairy', 'eggs', 'soy', 'shellfish', 'none');

CREATE TYPE listing_status AS ENUM ('draft', 'available', 'claimed', 'completed', 'expired', 'cancelled');
CREATE TYPE listing_visibility AS ENUM ('public', 'ngo_only', 'specific_ngo');
CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TYPE claim_status AS ENUM (
  'pending_accept',
  'accepted',
  'rejected',
  'en_route',
  'picked_up',
  'delivered',
  'completed',
  'cancelled'
);

CREATE TYPE vehicle_type AS ENUM ('walking', 'bicycle', 'two_wheeler', 'car', 'three_wheeler', 'van');

CREATE TYPE report_category AS ENUM (
  'listing_misleading',
  'listing_spoiled',
  'listing_fraudulent',
  'listing_wrong_location',
  'user_threatening',
  'user_no_show',
  'user_fake_identity',
  'user_inappropriate',
  'user_discrimination',
  'claim_fraud',
  'claim_fake_proof'
);

CREATE TYPE report_status AS ENUM ('pending', 'under_review', 'resolved', 'dismissed');
CREATE TYPE report_severity AS ENUM ('low', 'medium', 'high');

CREATE TYPE notification_type AS ENUM (
  'claim_created',
  'claim_accepted',
  'claim_rejected',
  'pickup_confirmed',
  'delivery_complete',
  'listing_expiring',
  'listing_expired',
  'new_listing_nearby',
  'urgent_listing',
  'rating_received',
  'verification_approved',
  'verification_rejected',
  'report_resolved',
  'impact_milestone',
  'donation_reminder'
);

CREATE TYPE notification_channel AS ENUM ('push', 'sms', 'email', 'in_app');

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  phone_country_code VARCHAR(5) NOT NULL DEFAULT '+91',
  email VARCHAR(255),
  google_id VARCHAR(255) UNIQUE,
  
  -- Profile
  full_name VARCHAR(255) NOT NULL,
  profile_photo_url TEXT,
  
  -- Roles (users can have multiple roles)
  roles user_role[] NOT NULL DEFAULT ARRAY['donor']::user_role[],
  active_role user_role NOT NULL DEFAULT 'donor',
  
  -- Verification
  verification_tier verification_tier NOT NULL DEFAULT 'tier0_phone',
  is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Settings
  preferred_language VARCHAR(10) NOT NULL DEFAULT 'en',
  notification_preferences JSONB NOT NULL DEFAULT '{}',
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  
  -- Trust & Safety
  trust_score DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
  suspension_reason TEXT,
  suspended_until TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  last_active_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_trust_score CHECK (trust_score >= 0 AND trust_score <= 5)
);

CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_roles ON users USING GIN(roles);
CREATE INDEX idx_users_verification_tier ON users(verification_tier);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ============================================================================
-- DONOR PROFILES
-- ============================================================================

CREATE TABLE donor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Donor Information
  donor_type donor_type NOT NULL,
  business_name VARCHAR(255),
  
  -- Location (default donation location)
  address TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  landmark TEXT,
  floor_number VARCHAR(50),
  gate_instructions TEXT,
  
  -- Verification Documents
  verification_document_url TEXT,
  verification_document_type VARCHAR(50), -- 'fssai', 'gst', 'ngo_cert', etc.
  verification_status verification_status NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Preferences
  typical_food_types food_type[] NOT NULL DEFAULT '{}',
  donation_schedule JSONB, -- {monday: {enabled: true, time: '21:00'}, ...}
  
  -- Stats
  total_donations INTEGER NOT NULL DEFAULT 0,
  total_kg_donated DECIMAL(10,2) NOT NULL DEFAULT 0,
  average_rating DECIMAL(3,2),
  total_ratings INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE INDEX idx_donor_profiles_user_id ON donor_profiles(user_id);
CREATE INDEX idx_donor_profiles_location ON donor_profiles USING GIST(location);
CREATE INDEX idx_donor_profiles_donor_type ON donor_profiles(donor_type);
CREATE INDEX idx_donor_profiles_verification_status ON donor_profiles(verification_status);

-- ============================================================================
-- RECEIVER PROFILES
-- ============================================================================

CREATE TABLE receiver_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Receiver Information
  receiver_type receiver_type NOT NULL,
  organization_name VARCHAR(255),
  
  -- Location
  address TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  preferred_radius_km INTEGER NOT NULL DEFAULT 5,
  
  -- Verification Documents (for NGOs)
  verification_document_url TEXT,
  verification_document_type VARCHAR(50), -- 'ngo_cert', 'school_cert', etc.
  verification_status verification_status NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Preferences
  dietary_restrictions dietary_info[],
  allergen_restrictions allergen[],
  preferred_food_types food_type[],
  daily_capacity INTEGER, -- meals per day (for NGOs)
  
  -- Stats
  total_claims INTEGER NOT NULL DEFAULT 0,
  total_kg_received DECIMAL(10,2) NOT NULL DEFAULT 0,
  average_rating DECIMAL(3,2),
  total_ratings INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id),
  CONSTRAINT valid_radius CHECK (preferred_radius_km >= 1 AND preferred_radius_km <= 25)
);

CREATE INDEX idx_receiver_profiles_user_id ON receiver_profiles(user_id);
CREATE INDEX idx_receiver_profiles_location ON receiver_profiles USING GIST(location);
CREATE INDEX idx_receiver_profiles_receiver_type ON receiver_profiles(receiver_type);
CREATE INDEX idx_receiver_profiles_verification_status ON receiver_profiles(verification_status);

-- ============================================================================
-- VOLUNTEER PROFILES
-- ============================================================================

CREATE TABLE volunteer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Vehicle Information
  vehicle_type vehicle_type NOT NULL,
  max_delivery_distance_km INTEGER NOT NULL DEFAULT 10,
  
  -- Availability Schedule
  availability_schedule JSONB, -- {monday: [{start: '09:00', end: '12:00'}], ...}
  
  -- Verification
  aadhaar_verified BOOLEAN NOT NULL DEFAULT FALSE,
  aadhaar_last_4 VARCHAR(4),
  
  -- Stats
  total_deliveries INTEGER NOT NULL DEFAULT 0,
  total_distance_km DECIMAL(10,2) NOT NULL DEFAULT 0,
  average_rating DECIMAL(3,2),
  total_ratings INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE INDEX idx_volunteer_profiles_user_id ON volunteer_profiles(user_id);
CREATE INDEX idx_volunteer_profiles_vehicle_type ON volunteer_profiles(vehicle_type);

-- ============================================================================
-- FOOD LISTINGS
-- ============================================================================

CREATE TABLE food_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Food Information
  title VARCHAR(255) NOT NULL,
  description TEXT,
  food_types food_type[] NOT NULL,
  
  -- Quantity
  quantity_value DECIMAL(10,2) NOT NULL,
  quantity_unit VARCHAR(20) NOT NULL, -- 'meals', 'kg', 'containers'
  
  -- Dietary Information
  is_vegetarian BOOLEAN,
  is_vegan BOOLEAN,
  is_halal BOOLEAN,
  allergens allergen[] NOT NULL DEFAULT '{}',
  
  -- Photos
  photo_urls TEXT[] NOT NULL DEFAULT '{}',
  
  -- Location
  pickup_address TEXT NOT NULL,
  pickup_location GEOGRAPHY(POINT, 4326) NOT NULL,
  floor_number VARCHAR(50),
  landmark TEXT,
  special_instructions TEXT,
  
  -- Timing
  ready_from TIMESTAMP WITH TIME ZONE NOT NULL,
  pickup_by TIMESTAMP WITH TIME ZONE NOT NULL,
  urgency_level urgency_level NOT NULL,
  
  -- Visibility & Status
  visibility listing_visibility NOT NULL DEFAULT 'public',
  specific_ngo_id UUID REFERENCES users(id),
  status listing_status NOT NULL DEFAULT 'available',
  
  -- Recurring
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  recurring_schedule JSONB,
  parent_listing_id UUID REFERENCES food_listings(id),
  
  -- Metadata
  view_count INTEGER NOT NULL DEFAULT 0,
  claim_count INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_pickup_window CHECK (pickup_by > ready_from),
  CONSTRAINT valid_quantity CHECK (quantity_value > 0)
);

CREATE INDEX idx_listings_donor_id ON food_listings(donor_id);
CREATE INDEX idx_listings_location ON food_listings USING GIST(pickup_location);
CREATE INDEX idx_listings_status ON food_listings(status);
CREATE INDEX idx_listings_urgency ON food_listings(urgency_level);
CREATE INDEX idx_listings_pickup_by ON food_listings(pickup_by);
CREATE INDEX idx_listings_created_at ON food_listings(created_at DESC);
CREATE INDEX idx_listings_food_types ON food_listings USING GIN(food_types);
CREATE INDEX idx_listings_visibility ON food_listings(visibility);

-- ============================================================================
-- CLAIMS
-- ============================================================================

CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES food_listings(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Status
  status claim_status NOT NULL DEFAULT 'pending_accept',
  
  -- Coordination
  pickup_code VARCHAR(6) NOT NULL,
  delivery_code VARCHAR(6),
  
  -- Timing
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  en_route_at TIMESTAMP WITH TIME ZONE,
  picked_up_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_by UUID REFERENCES users(id),
  cancellation_reason TEXT,
  
  -- Proof
  delivery_proof_url TEXT,
  
  -- Metadata
  estimated_pickup_time TIMESTAMP WITH TIME ZONE,
  actual_distance_km DECIMAL(10,2),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  UNIQUE(pickup_code),
  CONSTRAINT valid_claim_timing CHECK (
    (accepted_at IS NULL OR accepted_at >= claimed_at) AND
    (picked_up_at IS NULL OR picked_up_at >= accepted_at) AND
    (delivered_at IS NULL OR delivered_at >= picked_up_at)
  )
);

CREATE INDEX idx_claims_listing_id ON claims(listing_id);
CREATE INDEX idx_claims_receiver_id ON claims(receiver_id);
CREATE INDEX idx_claims_volunteer_id ON claims(volunteer_id);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_pickup_code ON claims(pickup_code);
CREATE INDEX idx_claims_created_at ON claims(created_at DESC);

-- ============================================================================
-- RATINGS
-- ============================================================================

CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  
  -- Rater & Ratee
  rater_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ratee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Rating
  overall_rating INTEGER NOT NULL,
  timeliness_rating INTEGER,
  conduct_rating INTEGER,
  quality_rating INTEGER,
  accuracy_rating INTEGER,
  communication_rating INTEGER,
  
  -- Comment
  comment TEXT,
  
  -- Moderation
  is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
  flag_reason TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  UNIQUE(claim_id, rater_id),
  CONSTRAINT valid_overall_rating CHECK (overall_rating >= 1 AND overall_rating <= 5),
  CONSTRAINT valid_sub_ratings CHECK (
    (timeliness_rating IS NULL OR (timeliness_rating >= 1 AND timeliness_rating <= 5)) AND
    (conduct_rating IS NULL OR (conduct_rating >= 1 AND conduct_rating <= 5)) AND
    (quality_rating IS NULL OR (quality_rating >= 1 AND quality_rating <= 5)) AND
    (accuracy_rating IS NULL OR (accuracy_rating >= 1 AND accuracy_rating <= 5)) AND
    (communication_rating IS NULL OR (communication_rating >= 1 AND communication_rating <= 5))
  )
);

CREATE INDEX idx_ratings_claim_id ON ratings(claim_id);
CREATE INDEX idx_ratings_rater_id ON ratings(rater_id);
CREATE INDEX idx_ratings_ratee_id ON ratings(ratee_id);
CREATE INDEX idx_ratings_created_at ON ratings(created_at DESC);

-- ============================================================================
-- REPORTS
-- ============================================================================

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Reporter
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Target
  reported_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reported_listing_id UUID REFERENCES food_listings(id) ON DELETE SET NULL,
  reported_claim_id UUID REFERENCES claims(id) ON DELETE SET NULL,
  
  -- Report Details
  category report_category NOT NULL,
  severity report_severity NOT NULL DEFAULT 'medium',
  description TEXT NOT NULL,
  evidence_urls TEXT[],
  
  -- Status
  status report_status NOT NULL DEFAULT 'pending',
  assigned_to UUID REFERENCES users(id),
  
  -- Resolution
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  action_taken TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT report_has_target CHECK (
    reported_user_id IS NOT NULL OR 
    reported_listing_id IS NOT NULL OR 
    reported_claim_id IS NOT NULL
  )
);

CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX idx_reports_reported_user_id ON reports(reported_user_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_severity ON reports(severity);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- ============================================================================
-- MESSAGES (In-App Communication)
-- ============================================================================

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  message_text TEXT NOT NULL,
  photo_url TEXT,
  is_quick_reply BOOLEAN NOT NULL DEFAULT FALSE,
  
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_message_length CHECK (LENGTH(message_text) <= 500)
);

CREATE INDEX idx_messages_claim_id ON messages(claim_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  notification_type notification_type NOT NULL,
  channel notification_channel NOT NULL,
  
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  
  data JSONB, -- Additional payload for deep linking
  
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================================
-- GAMIFICATION - KARMA POINTS
-- ============================================================================

CREATE TABLE karma_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  points INTEGER NOT NULL,
  reason VARCHAR(255) NOT NULL,
  
  related_listing_id UUID REFERENCES food_listings(id),
  related_claim_id UUID REFERENCES claims(id),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_karma_user_id ON karma_transactions(user_id);
CREATE INDEX idx_karma_created_at ON karma_transactions(created_at DESC);

-- ============================================================================
-- GAMIFICATION - BADGES
-- ============================================================================

CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  
  criteria JSONB NOT NULL, -- Conditions to earn this badge
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_earned_at ON user_badges(earned_at DESC);

-- ============================================================================
-- OTP VERIFICATION
-- ============================================================================

CREATE TABLE otp_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR(20) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  
  attempts INTEGER NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  locked_until TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_otp_phone ON otp_verifications(phone_number);
CREATE INDEX idx_otp_expires_at ON otp_verifications(expires_at);

-- ============================================================================
-- TRACKING EVENTS (for live tracking)
-- ============================================================================

CREATE TABLE tracking_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  event_type VARCHAR(50) NOT NULL, -- 'location_update', 'departed', 'arrived', etc.
  location GEOGRAPHY(POINT, 4326),
  
  metadata JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tracking_claim_id ON tracking_events(claim_id);
CREATE INDEX idx_tracking_volunteer_id ON tracking_events(volunteer_id);
CREATE INDEX idx_tracking_created_at ON tracking_events(created_at DESC);

-- ============================================================================
-- IMPACT METRICS (Aggregated)
-- ============================================================================

CREATE TABLE impact_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  metric_date DATE NOT NULL,
  city VARCHAR(100),
  
  total_listings INTEGER NOT NULL DEFAULT 0,
  total_claims INTEGER NOT NULL DEFAULT 0,
  total_completed INTEGER NOT NULL DEFAULT 0,
  total_kg_saved DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_meals INTEGER NOT NULL DEFAULT 0,
  co2_prevented_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  unique_donors INTEGER NOT NULL DEFAULT 0,
  unique_receivers INTEGER NOT NULL DEFAULT 0,
  unique_volunteers INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  UNIQUE(metric_date, city)
);

CREATE INDEX idx_impact_metrics_date ON impact_metrics(metric_date DESC);
CREATE INDEX idx_impact_metrics_city ON impact_metrics(city);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donor_profiles_updated_at BEFORE UPDATE ON donor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_receiver_profiles_updated_at BEFORE UPDATE ON receiver_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_volunteer_profiles_updated_at BEFORE UPDATE ON volunteer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_listings_updated_at BEFORE UPDATE ON food_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance_km(
  point1 GEOGRAPHY,
  point2 GEOGRAPHY
) RETURNS DECIMAL AS $$
BEGIN
  RETURN ST_Distance(point1, point2) / 1000.0;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to generate 6-digit code
CREATE OR REPLACE FUNCTION generate_6digit_code()
RETURNS VARCHAR AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Active listings with donor info
CREATE VIEW active_listings_view AS
SELECT 
  l.*,
  u.full_name AS donor_name,
  u.profile_photo_url AS donor_photo,
  dp.average_rating AS donor_rating,
  dp.donor_type,
  ST_X(l.pickup_location::geometry) AS longitude,
  ST_Y(l.pickup_location::geometry) AS latitude
FROM food_listings l
JOIN users u ON l.donor_id = u.id
JOIN donor_profiles dp ON u.id = dp.user_id
WHERE l.status = 'available'
  AND l.pickup_by > NOW()
  AND u.is_suspended = FALSE;

-- User stats view
CREATE VIEW user_stats_view AS
SELECT 
  u.id,
  u.full_name,
  u.roles,
  COALESCE(dp.total_donations, 0) AS total_donations,
  COALESCE(dp.total_kg_donated, 0) AS total_kg_donated,
  COALESCE(rp.total_claims, 0) AS total_claims,
  COALESCE(rp.total_kg_received, 0) AS total_kg_received,
  COALESCE(vp.total_deliveries, 0) AS total_deliveries,
  COALESCE(SUM(kt.points), 0) AS total_karma_points
FROM users u
LEFT JOIN donor_profiles dp ON u.id = dp.user_id
LEFT JOIN receiver_profiles rp ON u.id = rp.user_id
LEFT JOIN volunteer_profiles vp ON u.id = vp.user_id
LEFT JOIN karma_transactions kt ON u.id = kt.user_id
GROUP BY u.id, dp.total_donations, dp.total_kg_donated, 
         rp.total_claims, rp.total_kg_received, vp.total_deliveries;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default badges
INSERT INTO badges (code, name, description, criteria) VALUES
('first_meal', 'First Meal', 'Completed your first donation or claim', '{"min_actions": 1}'),
('consistent_giver', 'Consistent Giver', 'Completed 10 donations', '{"min_donations": 10}'),
('community_pillar', 'Community Pillar', 'Completed 50 donations', '{"min_donations": 50}'),
('food_hero', 'Food Hero', 'Completed 200 donations', '{"min_donations": 200}'),
('zero_waste_week', 'Zero Waste Week', 'Donated every day for 7 consecutive days', '{"consecutive_days": 7}'),
('quick_responder', 'Quick Responder', 'Accepted claims within 2 minutes, 5 times', '{"quick_accepts": 5, "max_seconds": 120}'),
('weekend_warrior', 'Weekend Warrior', 'Volunteered on 10+ weekends', '{"weekend_deliveries": 10}'),
('trusted_neighbour', 'Trusted Neighbour', 'Maintained 4.8+ rating for 3+ months', '{"min_rating": 4.8, "min_months": 3}');

COMMENT ON DATABASE foodbridge IS 'FoodBridge - Location-Based Food Redistribution Platform';
