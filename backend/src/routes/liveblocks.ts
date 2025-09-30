import { Router, Request, Response } from 'express';
import { LiveblocksService } from '../services/LiveblocksService';
import { LiveblocksAuthRequest, ApiError } from '../types';

const router = Router();
const liveblocksService = new LiveblocksService();

/**
 * POST /api/liveblocks/auth
 * Generate a Liveblocks session token for a user
 */
router.post(
  '/auth',
  async (
    req: Request<{}, { token: string } | ApiError, LiveblocksAuthRequest>,
    res: Response<{ token: string } | ApiError>
  ): Promise<void> => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        res.status(400).json({
          message: 'User ID is required',
          code: 'MISSING_USER_ID',
        });
        return;
      }
      
      console.log(`Creating Liveblocks session for user: ${userId}`);
      
      // Create user object with metadata
      const user = liveblocksService.createUser(userId);
      
      // Generate session token
      const token = await liveblocksService.createSession(user);
      
      console.log(`Liveblocks session created successfully for user: ${user.id}`);
      
      res.status(200).json({ token });
    } catch (error) {
      console.error('Liveblocks session creation failed:', error);
      
      const message = error instanceof Error ? error.message : 'Unknown error';
      
      res.status(500).json({
        message: 'Failed to create Liveblocks session',
        details: message,
        code: 'LIVEBLOCKS_SESSION_FAILED',
      });
    }
  }
);

export { router as liveblocksRouter };
