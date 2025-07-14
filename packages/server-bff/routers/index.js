import express from 'express';
import file from './file';
import test from './test';
import path from 'path';
import dotenv from 'dotenv';

const router = express.Router();

dotenv.config({
	path: path.join(__dirname, `../../../.env.${process.env.NODE_ENV}`),
});

router.use('/file', file);
router.use('/test', test);

export default router;
