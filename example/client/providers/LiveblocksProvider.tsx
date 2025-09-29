import { LiveblocksProvider as Provider } from "@liveblocks/react";
import { PropsWithChildren, useCallback } from "react";
import { useUser } from "../contexts/UserContext";

export function LiveblocksProvider({ children }: PropsWithChildren) {
  const { userId } = useUser();

  const authEndpoint = useCallback(async (room?: string) => {
    console.log("Auth request for user:", userId);

    try {
      const response = await fetch("/api/liveblocks/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Auth failed:", response.status, errorText);
        throw new Error(`Authentication failed: ${response.status}`);
      }

      const data = await response.json() as { token: string };
      console.log("Auth successful for user:", userId);
      return { token: data.token };
    } catch (error) {
      console.error("Auth error:", error);
      throw error;
    }
  }, [userId]);

  return (
    <Provider 
      authEndpoint={authEndpoint} 
      throttle={100}
    >
      {children}
    </Provider>
  );
}
