import * as authService from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { validateRegisterInput, validateLoginInput } from '../utils/validator.js';

export async function register(req, res) {
  const errors = validateRegisterInput(req.body);
  if (errors.length > 0) return sendError(res, 'Validation failed', 400, errors);

  try {
    const user = await authService.registerUser(req.body);
    return sendSuccess(res, { user }, 'Registration successful', 201);
  } catch (err) {
    if (err.message === 'Email already registered') {
      return sendError(res, err.message, 409);
    }
    console.error(err);
    return sendError(res, 'Internal server error', 500);
  }
}

export async function login(req, res) {
  const errors = validateLoginInput(req.body);
  if (errors.length > 0) return sendError(res, 'Validation failed', 400, errors);

  try {
    const result = await authService.loginUser(req.body);
    return sendSuccess(res, result, 'Login successful');
  } catch (err) {
    if (err.message === 'Invalid credentials') {
      return sendError(res, err.message, 401);
    }
    console.error(err);
    return sendError(res, 'Internal server error', 500);
  }
}