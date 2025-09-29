import { LiveblocksProvider as Provider } from "@liveblocks/react";
import { PropsWithChildren, useCallback, useRef } from "react";

export function LiveblocksProvider({ children }: PropsWithChildren) {
  const userIdRef = useRef<string | null>(null);

  const authEndpoint = useCallback(async (room?: string) => {
    // Get or create a stable user ID
    if (!userIdRef.current) {
      const storageKey = 'tldraw-user-session';
      const stored = sessionStorage.getItem(storageKey);
      
      if (stored) {
        const user = JSON.parse(stored);
        userIdRef.current = user.id;
      } else {
        const userId = `user-${Math.random().toString(36).substr(2, 9)}`;
        const newUser = {
          id: userId,
          color: '#4299E1',
          name: `User ${userId.slice(-3).toUpperCase()}`,
        };
        sessionStorage.setItem(storageKey, JSON.stringify(newUser));
        userIdRef.current = userId;
      }
    }

    console.log("Auth request for user:", userIdRef.current);

    try {
      const response = await fetch("/api/liveblocks/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userIdRef.current }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Auth failed:", response.status, errorText);
        throw new Error(`Authentication failed: ${response.status}`);
      }

      const data = await response.json() as { token: string };
      console.log("Auth successful for user:", userIdRef.current);
      return { token: data.token };
    } catch (error) {
      console.error("Auth error:", error);
      throw error;
    }
  }, []);

  return (
    <Provider 
      authEndpoint={authEndpoint} 
      throttle={100}
    >
      {children}
    </Provider>
  );
}
