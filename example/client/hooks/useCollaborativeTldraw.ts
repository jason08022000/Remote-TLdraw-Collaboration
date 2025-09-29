import { TLAnyShapeUtilConstructor, TLStoreWithStatus } from "tldraw";
import { useYjsStore } from "./useYjsStore";
import { useMemo } from "react";

interface UseCollaborativeTldrawOptions {
  shapeUtils?: TLAnyShapeUtilConstructor[];
}

/**
 * A React hook that provides a collaborative TLdraw store using Yjs and Liveblocks.
 * This hook generates a random user for demo purposes.
 */
export function useCollaborativeTldraw(
  options: UseCollaborativeTldrawOptions = {}
): TLStoreWithStatus {
  const { shapeUtils = [] } = options;

  // Generate a consistent user for this session (only once)
  const user = useMemo(() => {
    // Generate once and store in sessionStorage to persist across refreshes
    const storageKey = 'tldraw-user-session';
    const stored = sessionStorage.getItem(storageKey);
    
    if (stored) {
      return JSON.parse(stored);
    }
    
    const userId = `user-${Math.random().toString(36).substr(2, 9)}`;
    const colors = [
      '#E53E3E', '#D53F8C', '#9F7AEA', '#667EEA',
      '#4299E1', '#0BC5EA', '#00B5D8', '#00A3C4',
      '#38B2AC', '#48BB78', '#68D391', '#9AE6B4',
      '#F6E05E', '#ED8936', '#FF6B35', '#D583F0'
    ];
    
    const newUser = {
      id: userId,
      color: colors[Math.floor(Math.random() * colors.length)],
      name: `User ${userId.slice(-3).toUpperCase()}`,
    };
    
    sessionStorage.setItem(storageKey, JSON.stringify(newUser));
    return newUser;
  }, []);

  // Create the collaborative store using Yjs
  const store = useYjsStore({
    shapeUtils,
    user,
  });

  return store;
}
