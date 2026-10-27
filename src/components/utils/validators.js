export function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
}

export function isStrongPassword(v) {
  const s = String(v || '');
  return s.length >= 8 && /[A-Za-z]/.test(s) && /\d/.test(s);
}

export function minLen(v, n) {
  return String(v || '').length >= n;
}

export function required(v) {
  return v !== undefined && v !== null && String(v).trim().length > 0;
}

export function validateLoginForm({ email, password }) {
  const errors = {};
  if (!required(email)) errors.email = 'Email is required';
  else if (!isEmail(email)) errors.email = 'Invalid email format';
  if (!required(password)) errors.password = 'Password is required';
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateRegisterForm({ username, email, password, confirm }) {
  const errors = {};
  if (!required(username)) errors.username = 'Username is required';
  else if (!minLen(username, 3)) errors.username = 'At least 3 characters';
  if (!required(email)) errors.email = 'Email is required';
  else if (!isEmail(email)) errors.email = 'Invalid email format';
  if (!required(password)) errors.password = 'Password is required';
  else if (!isStrongPassword(password))
    errors.password = 'Min 8 chars, letters and numbers';
  if (password !== confirm) errors.confirm = 'Passwords do not match';
  return { valid: Object.keys(errors).length === 0, errors };
}