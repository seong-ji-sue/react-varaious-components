import express from 'express';
import {middleware} from '../middleware/middleware.js';
import {wrapAsync} from '../utils/apiWrapper.js';
import controllers from '../controllers';

const router = express.Router();

router.get('/', middleware, wrapAsync(controllers.test.findAll));

export default router;
