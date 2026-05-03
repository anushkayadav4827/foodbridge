-- Migration: Add responded_at column to claims table
-- This column tracks when a donor responds to a claim (accept or reject)
-- Required by: claim.service.ts (acceptClaim, rejectClaim, autoRejectExpiredClaims)

-- Add responded_at column to claims table
ALTER TABLE claims
ADD COLUMN responded_at TIMESTAMP WITH TIME ZONE;

-- Add index for performance (useful for queries filtering by response time)
CREATE INDEX idx_claims_responded_at ON claims(responded_at);

-- Add comment for documentation
COMMENT ON COLUMN claims.responded_at IS 'Timestamp when donor responded to the claim (accepted or rejected)';
