import * as userService from '../services/user.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getContacts(req, res) {
  try {
    const users = await userService.getAllUsers(req.user.email);
    return sendSuccess(res, { users });
  } catch (err) {
    return sendError(res, 'Internal server error', 500);
  }
}

export async function getPublicKey(req, res) {
  try {
    const { email } = req.params;
    const user = await userService.getUserPublicKey(email);
    return sendSuccess(res, user);
  } catch (err) {
    if (err.message === 'User not found') return sendError(res, err.message, 404);
    return sendError(res, 'Internal server error', 500);
  }
}