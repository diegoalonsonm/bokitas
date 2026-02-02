/**
 * Form validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  return { isValid: true };
}

/**
 * Validate password
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }

  return { isValid: true };
}

/**
 * Validate confirm password
 */
export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): ValidationResult {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true };
}

/**
 * Validate name (min 2 chars)
 */
export function validateName(name: string, fieldName: string = 'Name'): ValidationResult {
  if (!name.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters` };
  }

  return { isValid: true };
}

/**
 * Validate rating (1-5)
 */
export function validateRating(rating: number): ValidationResult {
  if (!rating || rating < 1 || rating > 5) {
    return { isValid: false, error: 'Rating must be between 1 and 5' };
  }

  if (!Number.isInteger(rating)) {
    return { isValid: false, error: 'Rating must be a whole number' };
  }

  return { isValid: true };
}

/**
 * Validate review comment (optional, max 2000 chars)
 */
export function validateComment(comment: string): ValidationResult {
  if (comment && comment.length > 2000) {
    return { isValid: false, error: 'Comment must be less than 2000 characters' };
  }

  return { isValid: true };
}

/**
 * Validate UUID format
 */
export function validateUUID(id: string): ValidationResult {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(id)) {
    return { isValid: false, error: 'Invalid ID format' };
  }

  return { isValid: true };
}

/**
 * Check if a string is a valid UUID
 */
export function isValidUUID(id: string): boolean {
  return validateUUID(id).isValid;
}
