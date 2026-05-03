export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateRegisterInput({ email, password, publicKey, encryptedPrivateKey }) {
  const errors = [];
  if (!email || !validateEmail(email))       errors.push('Invalid email');
  if (!password || password.length < 8)      errors.push('Password min 8 char');
  if (!publicKey)                             errors.push('Public key required');
  if (!encryptedPrivateKey)                  errors.push('Encrypted private key required');
  return errors;
}

export function validateLoginInput({ email, password }) {
  const errors = [];
  if (!email || !validateEmail(email)) errors.push('Invalid email');
  if (!password)                       errors.push('Password required');
  return errors;
}

export function validateMessageInput({ receiverEmail, ciphertext, iv, mac }) {
  const errors = [];
  if (!receiverEmail) errors.push('Receiver email required');
  if (!ciphertext)    errors.push('Ciphertext required');
  // iv and mac can be empty for now (placeholder implementation)
  return errors;
}