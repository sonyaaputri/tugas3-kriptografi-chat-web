export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateRegisterInput({ username, email, password, publicKey, encryptedPrivateKey, iv, salt }) {
  const errors = [];
  if (!username || username.trim().length < 3) errors.push('Username min 3 char');
  if (!email || !validateEmail(email))       errors.push('Invalid email');
  if (!password || password.length < 8)      errors.push('Password min 8 char');
  if (!publicKey)                             errors.push('Public key required');
  if (!encryptedPrivateKey)                  errors.push('Encrypted private key required');
  if (!iv)                                   errors.push('Private key IV required');
  if (!salt)                                 errors.push('Private key salt required');
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
  if (!receiverEmail || !validateEmail(receiverEmail)) errors.push('Valid receiver email required');
  if (!ciphertext)    errors.push('Ciphertext required');
  if (!iv)            errors.push('IV required');
  if (!mac)           errors.push('MAC required');
  return errors;
}
