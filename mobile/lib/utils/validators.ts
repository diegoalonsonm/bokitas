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
    return { isValid: false, error: 'El correo es requerido' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Formato de correo inválido' };
  }

  return { isValid: true };
}

/**
 * Validate password
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'La contraseña es requerida' };
  }

  if (password.length < 6) {
    return { isValid: false, error: 'La contraseña debe tener al menos 6 caracteres' };
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
    return { isValid: false, error: 'Por favor confirmá tu contraseña' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Las contraseñas no coinciden' };
  }

  return { isValid: true };
}

/**
 * Validate name (min 2 chars)
 */
export function validateName(name: string, fieldName: string = 'Nombre'): ValidationResult {
  if (!name.trim()) {
    return { isValid: false, error: `${fieldName} es requerido` };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: `${fieldName} debe tener al menos 2 caracteres` };
  }

  return { isValid: true };
}

/**
 * Validate rating (1-5)
 */
export function validateRating(rating: number): ValidationResult {
  if (!rating || rating < 1 || rating > 5) {
    return { isValid: false, error: 'La calificación debe estar entre 1 y 5' };
  }

  if (!Number.isInteger(rating)) {
    return { isValid: false, error: 'La calificación debe ser un número entero' };
  }

  return { isValid: true };
}

/**
 * Validate review comment (optional, max 2000 chars)
 */
export function validateComment(comment: string): ValidationResult {
  if (comment && comment.length > 2000) {
    return { isValid: false, error: 'El comentario debe tener menos de 2000 caracteres' };
  }

  return { isValid: true };
}

/**
 * Validate UUID format
 */
export function validateUUID(id: string): ValidationResult {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(id)) {
    return { isValid: false, error: 'Formato de ID inválido' };
  }

  return { isValid: true };
}

/**
 * Check if a string is a valid UUID
 */
export function isValidUUID(id: string): boolean {
  return validateUUID(id).isValid;
}
