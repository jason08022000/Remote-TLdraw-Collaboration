import { Liveblocks } from '@liveblocks/node';
import { env } from '../config/environment';
import { LiveblocksUser } from '../types';

export class LiveblocksService {
  private readonly liveblocks: Liveblocks;

  constructor() {
    this.liveblocks = new Liveblocks({
      secret: env.LIVEBLOCKS_SECRET_KEY,
    });
  }

  /**
   * Creates a Liveblocks session for the given user
   */
  async createSession(user: LiveblocksUser): Promise<string> {
    try {
      const session = this.liveblocks.prepareSession(user.id, {
        userInfo: user.info,
      });

      // Authorize access to all rooms for this demo
      session.allow('*', session.FULL_ACCESS);

      const authResult = await session.authorize();
      
      // Parse the Liveblocks response to extract the actual token
      if (typeof authResult === 'string') {
        return authResult;
      }
      
      // If authResult is an object, extract the token from the body
      if (authResult && typeof authResult === 'object' && 'body' in authResult) {
        const body = typeof authResult.body === 'string' 
          ? JSON.parse(authResult.body)
          : authResult.body;
        
        if (body && body.token) {
          return body.token;
        }
      }
      
      throw new Error('Invalid auth response format from Liveblocks');
    } catch (error) {
      throw new Error(`Failed to create Liveblocks session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Creates a complete user object with generated metadata
   */
  createUser(userId: string): LiveblocksUser {
    const cleanUserId = this.cleanUserId(userId);
    
    return {
      id: cleanUserId,
      info: {
        name: `User ${cleanUserId}`,
        color: this.generateRandomColor(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUserId}`,
      },
    };
  }

  /**
   * Generates a random color for user avatars
   */
  private generateRandomColor(): string {
    const colors = [
      '#E53E3E', '#D53F8C', '#9F7AEA', '#667EEA',
      '#4299E1', '#0BC5EA', '#00B5D8', '#00A3C4',
      '#38B2AC', '#48BB78', '#68D391', '#9AE6B4',
      '#F6E05E', '#ED8936', '#FF6B35', '#D583F0'
    ];
    
    return colors[Math.floor(Math.random() * colors.length)] || '#D583F0';
  }

  /**
   * Cleans and validates userId for Liveblocks compatibility
   */
  private cleanUserId(userId: string): string {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Remove invalid characters and convert to lowercase
    const cleaned = userId.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    
    if (cleaned.length === 0) {
      throw new Error('Invalid user ID: results in empty string after cleaning');
    }

    if (cleaned.length > 64) {
      throw new Error('User ID too long: maximum 64 characters allowed');
    }

    return cleaned;
  }
}
