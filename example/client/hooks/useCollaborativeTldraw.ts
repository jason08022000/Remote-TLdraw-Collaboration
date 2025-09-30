import { TLAnyShapeUtilConstructor, TLStoreWithStatus } from "tldraw";
import { useYjsStore } from "./useYjsStore";
import { useUser } from "../contexts/UserContext";
import { useMemo } from "react";

interface UseCollaborativeTldrawOptions {
  shapeUtils?: TLAnyShapeUtilConstructor[];
}

/**
 * A React hook that provides a collaborative TLdraw store using Yjs and Liveblocks.
 * Uses the shared user context for consistent identity across the app.
 */
export function useCollaborativeTldraw(
  options: UseCollaborativeTldrawOptions = {}
): TLStoreWithStatus {
  const { shapeUtils = [] } = options;
  const { userId, userName, userColor } = useUser();

  // Create user object from context
  const user = useMemo(() => ({
    id: userId,
    color: userColor,
    name: userName,
  }), [userId, userName, userColor]);

  // Create the collaborative store using Yjs
  const store = useYjsStore({
    shapeUtils,
    user,
  });

  return store;
}
