import Joi from 'joi';
import { 
  validateCoordinates,
  validateTimeWindow,
  validateCookedFoodTimeWindow,
  validateDietaryConsistency
} from '../types/listing.types';

// ============================================================================
// Joi Schemas
// ============================================================================

const foodTypeSchema = Joi.string().valid(
  'cooked_hot', 
  'cooked_cold', 
  'raw', 
  'packaged', 
  'baked', 
  'beverages'
);

const quantityUnitSchema = Joi.string().valid(
  'meals', 
  'kg', 
  'portions', 
  'servings', 
  'plates'
);

const allergenSchema = Joi.string().valid(
  'nuts', 
  'dairy', 
  'eggs', 
  'soy', 
  'shellfish', 
  'wheat', 
  'fish'
);

const listingStatusSchema = Joi.string().valid(
  'draft', 
  'available', 
  'claimed', 
  'in_progress', 
  'completed', 
  'expired', 
  'cancelled'
);

// ============================================================================
// Create Listing Schema
// ============================================================================

export const createListingSchema = Joi.object({
  // Required fields
  title: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 1 character',
      'string.max': 'Title must not exceed 100 characters',
    }),
  
  foodTypes: Joi.array()
    .items(foodTypeSchema)
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one food type must be selected',
      'any.required': 'Food types are required',
    }),
  
  quantityValue: Joi.number()
    .positive()
    .max(10000)
    .required()
    .messages({
      'number.positive': 'Quantity must be greater than 0',
      'number.max': 'Quantity cannot exceed 10000',
      'any.required': 'Quantity value is required',
    }),
  
  quantityUnit: quantityUnitSchema.required().messages({
    'any.required': 'Quantity unit is required',
  }),
  
  pickupAddress: Joi.string()
    .min(10)
    .max(500)
    .required()
    .messages({
      'string.empty': 'Pickup address is required',
      'string.min': 'Pickup address must be at least 10 characters',
      'string.max': 'Pickup address must not exceed 500 characters',
    }),
  
  pickupLatitude: Joi.number()
    .min(-90)
    .max(90)
    .required()
    .messages({
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90',
      'any.required': 'Pickup latitude is required',
    }),
  
  pickupLongitude: Joi.number()
    .min(-180)
    .max(180)
    .required()
    .messages({
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180',
      'any.required': 'Pickup longitude is required',
    }),
  
  readyFrom: Joi.date()
    .iso()
    .required()
    .messages({
      'date.base': 'Ready from must be a valid date',
      'any.required': 'Ready from time is required',
    }),
  
  pickupBy: Joi.date()
    .iso()
    .greater(Joi.ref('readyFrom'))
    .required()
    .messages({
      'date.base': 'Pickup by must be a valid date',
      'date.greater': 'Pickup by must be after ready from time',
      'any.required': 'Pickup by time is required',
    }),
  
  // Optional fields
  description: Joi.string()
    .max(500)
    .allow('', null)
    .messages({
      'string.max': 'Description must not exceed 500 characters',
    }),
  
  isVegetarian: Joi.boolean().default(false),
  isVegan: Joi.boolean().default(false),
  isHalal: Joi.boolean().default(false),
  isKosher: Joi.boolean().default(false),
  isGlutenFree: Joi.boolean().default(false),
  
  allergens: Joi.array()
    .items(allergenSchema)
    .default([]),
  
  photoUrls: Joi.array()
    .items(Joi.string().uri())
    .max(6)
    .default([])
    .messages({
      'array.max': 'Maximum 6 photos allowed per listing',
    }),
  
  coverPhotoUrl: Joi.string()
    .uri()
    .allow('', null),
  
  pickupInstructions: Joi.string()
    .max(500)
    .allow('', null)
    .messages({
      'string.max': 'Pickup instructions must not exceed 500 characters',
    }),
  
  bestBefore: Joi.date()
    .iso()
    .allow(null),
  
  preparationNotes: Joi.string()
    .max(500)
    .allow('', null)
    .messages({
      'string.max': 'Preparation notes must not exceed 500 characters',
    }),
}).custom((value, helpers) => {
  // Custom validation: Time window
  const timeWindowResult = validateTimeWindow(
    new Date(value.readyFrom), 
    new Date(value.pickupBy)
  );
  if (!timeWindowResult.valid) {
    return helpers.error('any.custom', { message: timeWindowResult.error });
  }
  
  // Custom validation: Cooked food time window
  const cookedFoodResult = validateCookedFoodTimeWindow(
    new Date(value.readyFrom),
    new Date(value.pickupBy),
    value.foodTypes
  );
  if (!cookedFoodResult.valid) {
    return helpers.error('any.custom', { message: cookedFoodResult.error });
  }
  
  // Custom validation: Dietary consistency
  if (value.isVegan) {
    const dietaryResult = validateDietaryConsistency(
      value.isVegan,
      value.allergens || []
    );
    if (!dietaryResult.valid) {
      return helpers.error('any.custom', { message: dietaryResult.error });
    }
  }
  
  // Custom validation: Coordinates
  if (!validateCoordinates(value.pickupLatitude, value.pickupLongitude)) {
    return helpers.error('any.custom', { 
      message: 'Invalid coordinates provided' 
    });
  }
  
  return value;
});

// ============================================================================
// Update Listing Schema
// ============================================================================

export const updateListingSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .messages({
      'string.min': 'Title must be at least 1 character',
      'string.max': 'Title must not exceed 100 characters',
    }),
  
  description: Joi.string()
    .max(500)
    .allow('', null)
    .messages({
      'string.max': 'Description must not exceed 500 characters',
    }),
  
  foodTypes: Joi.array()
    .items(foodTypeSchema)
    .min(1)
    .messages({
      'array.min': 'At least one food type must be selected',
    }),
  
  quantityValue: Joi.number()
    .positive()
    .max(10000)
    .messages({
      'number.positive': 'Quantity must be greater than 0',
      'number.max': 'Quantity cannot exceed 10000',
    }),
  
  quantityUnit: quantityUnitSchema,
  
  isVegetarian: Joi.boolean(),
  isVegan: Joi.boolean(),
  isHalal: Joi.boolean(),
  isKosher: Joi.boolean(),
  isGlutenFree: Joi.boolean(),
  
  allergens: Joi.array()
    .items(allergenSchema),
  
  photoUrls: Joi.array()
    .items(Joi.string().uri())
    .max(6)
    .messages({
      'array.max': 'Maximum 6 photos allowed per listing',
    }),
  
  coverPhotoUrl: Joi.string()
    .uri()
    .allow('', null),
  
  pickupAddress: Joi.string()
    .min(10)
    .max(500)
    .messages({
      'string.min': 'Pickup address must be at least 10 characters',
      'string.max': 'Pickup address must not exceed 500 characters',
    }),
  
  pickupLatitude: Joi.number()
    .min(-90)
    .max(90)
    .messages({
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90',
    }),
  
  pickupLongitude: Joi.number()
    .min(-180)
    .max(180)
    .messages({
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180',
    }),
  
  pickupInstructions: Joi.string()
    .max(500)
    .allow('', null)
    .messages({
      'string.max': 'Pickup instructions must not exceed 500 characters',
    }),
  
  readyFrom: Joi.date().iso(),
  
  pickupBy: Joi.date()
    .iso()
    .when('readyFrom', {
      is: Joi.exist(),
      then: Joi.date().greater(Joi.ref('readyFrom')),
    })
    .messages({
      'date.greater': 'Pickup by must be after ready from time',
    }),
  
  bestBefore: Joi.date()
    .iso()
    .allow(null),
  
  preparationNotes: Joi.string()
    .max(500)
    .allow('', null)
    .messages({
      'string.max': 'Preparation notes must not exceed 500 characters',
    }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
}).custom((value, helpers) => {
  // Custom validation: Time window (if both times provided)
  if (value.readyFrom && value.pickupBy) {
    const timeWindowResult = validateTimeWindow(
      new Date(value.readyFrom), 
      new Date(value.pickupBy)
    );
    if (!timeWindowResult.valid) {
      return helpers.error('any.custom', { message: timeWindowResult.error });
    }
    
    // Custom validation: Cooked food time window
    if (value.foodTypes) {
      const cookedFoodResult = validateCookedFoodTimeWindow(
        new Date(value.readyFrom),
        new Date(value.pickupBy),
        value.foodTypes
      );
      if (!cookedFoodResult.valid) {
        return helpers.error('any.custom', { message: cookedFoodResult.error });
      }
    }
  }
  
  // Custom validation: Dietary consistency
  if (value.isVegan && value.allergens) {
    const dietaryResult = validateDietaryConsistency(
      value.isVegan,
      value.allergens
    );
    if (!dietaryResult.valid) {
      return helpers.error('any.custom', { message: dietaryResult.error });
    }
  }
  
  // Custom validation: Coordinates (if both provided)
  if (value.pickupLatitude !== undefined && value.pickupLongitude !== undefined) {
    if (!validateCoordinates(value.pickupLatitude, value.pickupLongitude)) {
      return helpers.error('any.custom', { 
        message: 'Invalid coordinates provided' 
      });
    }
  }
  
  return value;
});

// ============================================================================
// Listing Filters Schema
// ============================================================================

export const listingFiltersSchema = Joi.object({
  donorId: Joi.string().uuid(),
  
  status: Joi.array()
    .items(listingStatusSchema)
    .single(),
  
  sortBy: Joi.string()
    .valid('newest', 'oldest', 'expiring_soon', 'most_claims')
    .default('newest'),
  
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20),
  
  search: Joi.string()
    .max(100)
    .allow(''),
});

// ============================================================================
// Claim Actions Schema
// ============================================================================

export const acceptClaimSchema = Joi.object({
  claimId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Invalid claim ID format',
      'any.required': 'Claim ID is required',
    }),
});

export const rejectClaimSchema = Joi.object({
  claimId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Invalid claim ID format',
      'any.required': 'Claim ID is required',
    }),
  
  reason: Joi.string()
    .valid('prefer_local', 'prefer_organization', 'low_reliability', 'other')
    .allow('', null),
  
  details: Joi.string()
    .max(500)
    .allow('', null)
    .messages({
      'string.max': 'Rejection details must not exceed 500 characters',
    }),
});

// ============================================================================
// Cancellation Schema
// ============================================================================

export const cancelListingSchema = Joi.object({
  reason: Joi.string()
    .valid('plans_changed', 'food_spoiled', 'no_longer_available', 'other')
    .required()
    .messages({
      'any.required': 'Cancellation reason is required',
      'any.only': 'Invalid cancellation reason',
    }),
  
  details: Joi.string()
    .max(500)
    .allow('', null)
    .messages({
      'string.max': 'Cancellation details must not exceed 500 characters',
    }),
});

// ============================================================================
// Draft Schema
// ============================================================================

export const saveDraftSchema = Joi.object({
  data: Joi.object().required(),
  currentStep: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.min': 'Step must be between 1 and 5',
      'number.max': 'Step must be between 1 and 5',
      'any.required': 'Current step is required',
    }),
});

// ============================================================================
// Validation Middleware
// ============================================================================

export function validateRequest(schema: Joi.ObjectSchema) {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors,
      });
    }
    
    req.body = value;
    next();
  };
}

export function validateQuery(schema: Joi.ObjectSchema) {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Query validation failed',
        details: errors,
      });
    }
    
    req.query = value;
    next();
  };
}

export function validateParams(schema: Joi.ObjectSchema) {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Parameter validation failed',
        details: errors,
      });
    }
    
    req.params = value;
    next();
  };
}


// ============================================================================
// Exported Validation Middleware
// ============================================================================

export const validateCreateListing = validateRequest(createListingSchema);
export const validateUpdateListing = validateRequest(updateListingSchema);
export const validateCancellation = validateRequest(cancelListingSchema);
export const validateListingFilters = validateQuery(listingFiltersSchema);
export const validateDraftSave = validateRequest(saveDraftSchema);

