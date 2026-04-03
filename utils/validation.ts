import { z } from 'zod';

// Indian phone number validation
export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(/^\+91[6-9]\d{9}$/, 'Please enter a valid Indian phone number (+91XXXXXXXXXX)');

// Name validation
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces');

// Email validation (if needed)
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .optional();

// City validation
export const citySchema = z
  .string()
  .min(1, 'City is required')
  .max(30, 'City name must be less than 30 characters');

// Platform validation
export const platformSchema = z
  .string()
  .min(1, 'Platform is required')
  .max(30, 'Platform name must be less than 30 characters');

// Weekly earnings validation
export const earningsSchema = z
  .string()
  .min(1, 'Weekly earnings are required')
  .regex(/^\d+$/, 'Please enter a valid amount');

// Signup form validation schema
export const signupFormSchema = z.object({
  fullName: nameSchema,
  phone: phoneSchema,
  city: citySchema,
  platform: platformSchema,
  weeklyEarnings: earningsSchema,
});

// Login form validation schema
export const loginFormSchema = z.object({
  phone: phoneSchema,
  otp: z
    .string()
    .min(6, 'OTP must be 6 digits')
    .max(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits')
    .optional(),
});

// OTP request schema
export const otpRequestSchema = z.object({
  phone: phoneSchema,
});

// Type inference for forms
export type SignupFormType = z.infer<typeof signupFormSchema>;
export type LoginFormType = z.infer<typeof loginFormSchema>;
export type OtpRequestType = z.infer<typeof otpRequestSchema>;

// Validation helper functions
export const validateForm = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: boolean; data?: T; errors?: Record<string, string> } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path.join('.')] = err.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
};

// Real-time validation for phone input
export const validatePhoneInput = (value: string): {
  isValid: boolean;
  errorMessage?: string;
  formattedValue?: string;
} => {
  if (!value) {
    return { isValid: false, errorMessage: 'Phone number is required' };
  }

  // Remove all non-digit characters except + at the beginning
  let cleaned = value.replace(/[^\d+]/g, '');
  
  // Add +91 if not present and number starts with 6-9
  if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
    cleaned = '+91' + cleaned;
  }

  const isValid = /^\+91[6-9]\d{9}$/.test(cleaned);
  
  return {
    isValid,
    errorMessage: isValid ? undefined : 'Please enter a valid Indian phone number',
    formattedValue: cleaned,
  };
};

// Real-time validation for name input
export const validateNameInput = (value: string): {
  isValid: boolean;
  errorMessage?: string;
} => {
  if (!value) {
    return { isValid: false, errorMessage: 'Name is required' };
  }

  if (value.length < 2) {
    return { isValid: false, errorMessage: 'Name must be at least 2 characters' };
  }

  if (value.length > 50) {
    return { isValid: false, errorMessage: 'Name must be less than 50 characters' };
  }

  const isValid = /^[a-zA-Z\s]+$/.test(value);
  
  return {
    isValid,
    errorMessage: isValid ? undefined : 'Name can only contain letters and spaces',
  };
};
