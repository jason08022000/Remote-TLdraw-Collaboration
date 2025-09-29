import { ClientSideSuspense, RoomProvider } from "@liveblocks/react/suspense";
import { ReactNode, useMemo, useCallback } from "react";
import { LiveMap } from "@liveblocks/core";
import { Box, Spinner } from "@chakra-ui/react";

interface RoomProps {
  children: ReactNode;
  roomId?: string;
}

export function Room({ children, roomId: customRoomId }: RoomProps) {
  const roomId = useMemo(() => {
    return customRoomId || "tldraw-collaborative-whiteboard";
  }, [customRoomId]);

  return (
    <RoomProvider
      id={roomId}
      initialPresence={{ presence: undefined }}
      initialStorage={{ records: new LiveMap() }}
    >
      <ClientSideSuspense 
        fallback={
          <Box display="flex" alignItems="center" justifyContent="center" h="100%">
            <Spinner size="lg" color="blue.500" />
          </Box>
        }
      >
        {children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}
