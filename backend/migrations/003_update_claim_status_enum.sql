-- Migration: Update claim_status enum to add new values
-- Date: 2026-05-02
-- Purpose: Add 'pending', 'auto_rejected' values to claim_status enum for donor dashboard system

-- Add new enum values
ALTER TYPE claim_status ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE claim_status ADD VALUE IF NOT EXISTS 'auto_rejected';

-- Note: The existing 'pending_accept' value will remain for backward compatibility
-- New code should use 'pending' for consistency with the design document
