// src/server/utils/validation.js
import Joi from "joi";

// User signup validation
export const signUpSchema = Joi.object({
  username: Joi.string().min(3).max(50).required().messages({
    "string.min": "Username must be at least 3 characters",
    "string.max": "Username cannot exceed 50 characters",
    "any.required": "Username is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .min(8)
    .required()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])"))
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      "any.required": "Password is required",
    }),
  firstName: Joi.string().min(2).max(50).required().messages({
    "string.min": "First name must be at least 2 characters",
    "string.max": "First name cannot exceed 50 characters",
    "any.required": "First name is required",
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    "string.min": "Last name must be at least 2 characters",
    "string.max": "Last name cannot exceed 50 characters",
    "any.required": "Last name is required",
  }),
  isAdmin: Joi.boolean().default(false),
  role: Joi.string().valid("user", "admin", "courier").default("user"),
  profileImage: Joi.string().uri().allow("", null),
});

// User login validation
export const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    "any.required": "Username is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

// Recipient validation
const recipientSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.min": "Recipient name must be at least 2 characters",
    "string.max": "Recipient name cannot exceed 100 characters",
    "any.required": "Recipient name is required",
  }),
  phone: Joi.string()
    .pattern(/^\+?[\d\s()-]{8,15}$/)
    .allow("", null)
    .messages({
      "string.pattern.base": "Please provide a valid phone number",
    }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid recipient email address",
    "any.required": "Recipient email is required",
  }),
});

// Location validation
const locationSchema = Joi.object({
  address: Joi.string().required().messages({
    "any.required": "Address is required",
  }),
  city: Joi.string().required().messages({
    "any.required": "City is required",
  }),
  state: Joi.string().allow("", null),
  country: Joi.string().allow("", null),
  postalCode: Joi.string().allow("", null),
  coordinates: Joi.array().items(Joi.number()).length(2).allow(null),
});

// Parcel validation
export const parcelSchema = Joi.object({
  parcelType: Joi.string()
    .valid(
      "document",
      "package",
      "fragile",
      "perishable",
      "electronics",
      "other",
    )
    .required()
    .messages({
      "any.required": "Parcel type is required",
      "any.only":
        "Parcel type must be one of: document, package, fragile, perishable, electronics, other",
    }),
  description: Joi.string().max(500).allow("", null).messages({
    "string.max": "Description cannot exceed 500 characters",
  }),
  sender: Joi.string().required().messages({
    "any.required": "Sender ID is required",
  }),
  weight: Joi.number().min(0.1).max(1000).required().messages({
    "number.min": "Weight must be at least 0.1 kg",
    "number.max": "Weight cannot exceed 1000 kg",
    "any.required": "Weight is required",
  }),
  dimensions: Joi.object({
    length: Joi.number().min(0),
    width: Joi.number().min(0),
    height: Joi.number().min(0),
    unit: Joi.string().valid("cm", "in").default("cm"),
  }).allow(null),
  price: Joi.object({
    amount: Joi.number().min(0),
    currency: Joi.string().valid("USD", "EUR", "GBP", "JPY").default("USD"),
  }).allow(null),
  status: Joi.string()
    .valid(
      "pending",
      "in-transit",
      "delivered",
      "returned",
      "cancelled",
      "processing",
      "on-hold",
    )
    .default("pending"),
  locationFrom: locationSchema.required().messages({
    "any.required": "Origin location is required",
  }),
  locationTo: locationSchema.required().messages({
    "any.required": "Destination location is required",
  }),
  presentLocation: locationSchema.allow(null),
  notes: Joi.string().max(500).allow("", null).messages({
    "string.max": "Notes cannot exceed 500 characters",
  }),
  recipient: recipientSchema.required().messages({
    "any.required": "Recipient information is required",
  }),
  trackingCode: Joi.string().allow("", null),
  courierAssigned: Joi.string().allow("", null),
});

// Parcel status update validation
export const parcelStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      "pending",
      "in-transit",
      "delivered",
      "returned",
      "cancelled",
      "processing",
      "on-hold",
    )
    .required()
    .messages({
      "any.required": "Status is required",
      "any.only":
        "Status must be one of: pending, in-transit, delivered, returned, cancelled, processing, on-hold",
    }),
});

// Parcel location update validation
export const parcelLocationSchema = Joi.object({
  presentLocation: locationSchema.required().messages({
    "any.required": "Present location details are required",
  }),
});

// Parcel destination update validation
export const parcelDestinationSchema = Joi.object({
  locationTo: locationSchema.required().messages({
    "any.required": "Destination location details are required",
  }),
});

// Profile update validation
export const profileUpdateSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).messages({
    "string.min": "First name must be at least 2 characters",
    "string.max": "First name cannot exceed 50 characters",
  }),
  lastName: Joi.string().min(2).max(50).messages({
    "string.min": "Last name must be at least 2 characters",
    "string.max": "Last name cannot exceed 50 characters",
  }),
  email: Joi.string().email().messages({
    "string.email": "Please provide a valid email address",
  }),
  profileImage: Joi.string().uri().allow("", null),
}).min(1);

// Password update validation
export const passwordUpdateSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "any.required": "Current password is required",
  }),
  newPassword: Joi.string()
    .min(8)
    .required()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])"))
    .messages({
      "string.min": "New password must be at least 8 characters",
      "string.pattern.base":
        "New password must contain at least one uppercase letter, one lowercase letter, and one number",
      "any.required": "New password is required",
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Passwords must match",
      "any.required": "Confirm password is required",
    }),
});

// Validation middleware factory
export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorDetails = error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
    }));

    return res.status(400).json({
      status: "error",
      statusCode: 400,
      message: "Validation error",
      errors: errorDetails,
    });
  }

  next();
};
