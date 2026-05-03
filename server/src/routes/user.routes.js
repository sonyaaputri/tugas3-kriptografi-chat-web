import { Router } from 'express';
import { getContacts, getPublicKey } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Semua route user butuh JWT yang valid
router.use(authenticate);

router.get('/contacts',         getContacts);
router.get('/:email/public-key', getPublicKey);

export default router;