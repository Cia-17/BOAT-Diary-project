/**
 * OWASP A07:2021 - Identification and Authentication Failures
 * Strong password validation implementation
 * 
 * Requirements:
 * - Minimum 12 characters
 * - Mix of uppercase, lowercase, numbers, and symbols
 * - No common passwords
 * - Password strength scoring
 */

export interface PasswordValidationResult {
  valid: boolean;
  message: string;
  strength: number; // 0-6
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSymbol: boolean;
    notCommon: boolean;
  };
}

// Common passwords list (top 100 most common)
const COMMON_PASSWORDS = [
  'password', '123456', '123456789', '12345678', '12345',
  '1234567', '1234567890', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', '1234567890',
  'password1', 'qwerty123', 'welcome123', 'admin123', 'password12',
  'iloveyou', 'princess', 'rockyou', '1234567', '123456a',
  'sunshine', 'football', 'baseball', 'welcome', 'login',
  'master', 'hello', 'freedom', 'whatever', 'qazwsx',
  'trustno1', 'dragon', 'passw0rd', 'jordan23', 'harley',
  'shadow', 'superman', 'qwertyuiop', 'michael', 'jennifer'
];

/**
 * Validates password strength according to OWASP guidelines
 */
export function validatePassword(password: string): PasswordValidationResult {
  const requirements = {
    minLength: password.length >= 12,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSymbol: /[^a-zA-Z0-9]/.test(password),
    notCommon: !COMMON_PASSWORDS.some(common => 
      password.toLowerCase().includes(common.toLowerCase())
    ),
  };

  // Calculate strength (0-6)
  let strength = 0;
  if (requirements.minLength) strength++;
  if (password.length >= 16) strength++;
  if (requirements.hasUppercase) strength++;
  if (requirements.hasLowercase) strength++;
  if (requirements.hasNumber) strength++;
  if (requirements.hasSymbol) strength++;

  // Check if all requirements are met
  const allRequirementsMet = Object.values(requirements).every(req => req === true);

  // Generate error message
  let message = '';
  if (!allRequirementsMet) {
    const missing: string[] = [];
    if (!requirements.minLength) missing.push('at least 12 characters');
    if (!requirements.hasUppercase) missing.push('uppercase letter');
    if (!requirements.hasLowercase) missing.push('lowercase letter');
    if (!requirements.hasNumber) missing.push('number');
    if (!requirements.hasSymbol) missing.push('symbol');
    if (!requirements.notCommon) missing.push('not be a common password');
    
    message = `Password must contain: ${missing.join(', ')}`;
  }

  return {
    valid: allRequirementsMet && strength >= 4,
    message: allRequirementsMet && strength >= 4 ? '' : message,
    strength,
    requirements,
  };
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(strength: number): string {
  if (strength <= 2) return 'Very Weak';
  if (strength <= 3) return 'Weak';
  if (strength <= 4) return 'Fair';
  if (strength <= 5) return 'Good';
  return 'Strong';
}

