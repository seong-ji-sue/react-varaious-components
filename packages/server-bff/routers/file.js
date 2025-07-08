import express from 'express';
import {middleware} from '../middleware/middleware.js';
import {wrapAsync} from '../utils/apiWrapper.js';
import controllers from '../controllers/index.js';

const router = express.Router();

router.post('/multi', middleware, wrapAsync(controllers.file.multi.create));
router.post('/single', middleware, wrapAsync(controllers.file.single.create));

export default router;
