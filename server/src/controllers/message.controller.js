import * as messageService from '../services/message.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { validateMessageInput } from '../utils/validator.js';

export async function sendMessage(req, res) {
  const errors = validateMessageInput(req.body);
  if (errors.length > 0) return sendError(res, 'Validation failed', 400, errors);

  try {
    const message = await messageService.saveMessage({
      senderEmail: req.user.email,  // dari JWT
      receiverEmail: req.body.receiverEmail,
      ciphertext: req.body.ciphertext,
      iv: req.body.iv,
      mac: req.body.mac,           
    });
    return sendSuccess(res, { message }, 'Message sent', 201);
  } catch (err) {
    console.error(err);
    return sendError(res, 'Internal server error', 500);
  }
}

export async function getMessages(req, res) {
  try {
    const { contactEmail } = req.params;
    const messages = await messageService.getMessages(req.user.email, contactEmail);
    return sendSuccess(res, { messages });
  } catch (err) {
    return sendError(res, 'Internal server error', 500);
  }
}