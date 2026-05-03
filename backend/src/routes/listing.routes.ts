import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { ListingController } from '../controllers/listing.controller';
import { getClaimsForListing } from '../controllers/claim.controller';
import { 
  validateCreateListing, 
  validateUpdateListing, 
  validateCancellation,
  validateListingFilters,
  validateDraftSave,
} from '../validators/listing.validator';

const router = Router();

// Public routes (with optional auth for personalization)
router.get('/', optionalAuth, validateListingFilters, ListingController.getListings);
router.get('/:id', optionalAuth, ListingController.getListing);

// Protected routes
router.use(authenticate);

// Listing CRUD
router.post('/', validateCreateListing, ListingController.createListing);
router.put('/:id', validateUpdateListing, ListingController.updateListing);
router.delete('/:id', validateCancellation, ListingController.cancelListing);

// My listings
router.get('/me/listings', validateListingFilters, ListingController.getMyListings);

// Claims for a listing
router.get('/:listingId/claims', getClaimsForListing);

// Draft management
router.post('/drafts', validateDraftSave, ListingController.saveDraft);
router.get('/drafts/me', ListingController.getMyDraft);
router.delete('/drafts/:id', ListingController.deleteDraft);

export default router;
