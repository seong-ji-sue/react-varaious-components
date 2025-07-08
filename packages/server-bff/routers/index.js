import express from 'express';
import file from './file.js';

const router = express.Router();

router.use('/file', file);

export default router;
