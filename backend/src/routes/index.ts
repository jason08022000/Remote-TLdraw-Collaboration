import { Router } from 'express';
import { tokensRouter } from './tokens';
import { healthRouter } from './health';
import { liveblocksRouter } from './liveblocks';

const router = Router();

// Mount routes
router.use('/health', healthRouter);
router.use('/tokens', tokensRouter);
router.use('/liveblocks', liveblocksRouter);

export { router as apiRoutes };
