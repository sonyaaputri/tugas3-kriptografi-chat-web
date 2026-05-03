import { Router } from 'express';
import { sendMessage, getMessages } from '../controllers/message.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/',                    sendMessage);
router.get('/:contactEmail',        getMessages);

export default router;