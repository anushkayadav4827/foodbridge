import Joi from 'joi';

export const sendOTPSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be 10 digits',
      'any.required': 'Phone number is required',
    }),
  countryCode: Joi.string()
    .pattern(/^\+[0-9]{1,4}$/)
    .default('+91')
    .messages({
      'string.pattern.base': 'Invalid country code format',
    }),
});

export const verifyOTPSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be 10 digits',
      'any.required': 'Phone number is required',
    }),
  otpCode: Joi.string()
    .length(6)
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      'string.length': 'OTP must be 6 digits',
      'string.pattern.base': 'OTP must contain only numbers',
      'any.required': 'OTP code is required',
    }),
  countryCode: Joi.string()
    .pattern(/^\+[0-9]{1,4}$/)
    .default('+91'),
});

export const completeOnboardingSchema = Joi.object({
  fullName: Joi.string()
    .min(2)
    .max(255)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name must not exceed 255 characters',
      'any.required': 'Full name is required',
    }),
  role: Joi.string()
    .valid('donor', 'receiver', 'volunteer')
    .required()
    .messages({
      'any.only': 'Role must be donor, receiver, or volunteer',
      'any.required': 'Role is required',
    }),
  profilePhoto: Joi.string().uri().optional(),
  
  // Donor-specific data
  donorData: Joi.when('role', {
    is: 'donor',
    then: Joi.object({
      donorType: Joi.string()
        .valid('restaurant', 'supermarket', 'catering', 'household', 'corporate', 'event_venue')
        .required(),
      businessName: Joi.string().max(255).optional(),
      address: Joi.string().required(),
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
      landmark: Joi.string().optional(),
      floorNumber: Joi.string().max(50).optional(),
      gateInstructions: Joi.string().optional(),
      typicalFoodTypes: Joi.array().items(Joi.string()).optional(),
      donationSchedule: Joi.object().optional(),
    }).required(),
    otherwise: Joi.forbidden(),
  }),
  
  // Receiver-specific data
  receiverData: Joi.when('role', {
    is: 'receiver',
    then: Joi.object({
      receiverType: Joi.string()
        .valid('individual', 'family', 'ngo', 'shelter', 'community_kitchen', 'school', 'orphanage')
        .required(),
      organizationName: Joi.string().max(255).optional(),
      address: Joi.string().required(),
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
      preferredRadiusKm: Joi.number().min(1).max(25).default(5),
      dietaryRestrictions: Joi.array().items(Joi.string()).optional(),
      allergenRestrictions: Joi.array().items(Joi.string()).optional(),
      preferredFoodTypes: Joi.array().items(Joi.string()).optional(),
      dailyCapacity: Joi.number().min(1).optional(),
    }).required(),
    otherwise: Joi.forbidden(),
  }),
  
  // Volunteer-specific data
  volunteerData: Joi.when('role', {
    is: 'volunteer',
    then: Joi.object({
      vehicleType: Joi.string()
        .valid('walking', 'bicycle', 'two_wheeler', 'car', 'three_wheeler', 'van')
        .required(),
      maxDeliveryDistanceKm: Joi.number().min(1).max(50).default(10),
      availabilitySchedule: Joi.object().optional(),
    }).required(),
    otherwise: Joi.forbidden(),
  }),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required',
  }),
});
