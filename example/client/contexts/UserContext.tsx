import { createContext, useContext, useState, useCallback, useEffect, PropsWithChildren } from 'react';

interface UserContextType {
  userName: string;
  roomId: string;
  setUserDetails: (name: string, room: string) => void;
  resetUserDetails: () => void;
  hasSetDetails: boolean;
  userId: string;
  userColor: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: PropsWithChildren) {
  const [userName, setUserNameState] = useState('');
  const [roomId, setRoomIdState] = useState('');
  const [hasSetDetails, setHasSetDetails] = useState(() => {
    const stored = sessionStorage.getItem('tldraw-user-session');
    if (stored) {
      const user = JSON.parse(stored);
      return !!(user.name && user.roomId);
    }
    return false;
  });

  // Initialize from storage if available
  useEffect(() => {
    const stored = sessionStorage.getItem('tldraw-user-session');
    if (stored) {
      const user = JSON.parse(stored);
      if (user.name && user.roomId) {
        setUserNameState(user.name);
        setRoomIdState(user.roomId);
      }
    }
  }, []);

  // Generate consistent user ID and color
  const [userId] = useState(() => {
    const storageKey = 'tldraw-user-session';
    const stored = sessionStorage.getItem(storageKey);
    
    if (stored) {
      const user = JSON.parse(stored);
      return user.id;
    }
    
    return `user-${Math.random().toString(36).substr(2, 9)}`;
  });

  const [userColor] = useState(() => {
    const colors = [
      '#E53E3E', '#D53F8C', '#9F7AEA', '#667EEA',
      '#4299E1', '#0BC5EA', '#00B5D8', '#00A3C4',
      '#38B2AC', '#48BB78', '#68D391', '#9AE6B4',
      '#F6E05E', '#ED8936', '#FF6B35', '#D583F0'
    ];
    
    const stored = sessionStorage.getItem('tldraw-user-session');
    if (stored) {
      const user = JSON.parse(stored);
      return user.color;
    }
    
    return colors[Math.floor(Math.random() * colors.length)];
  });

  const setUserDetails = useCallback((name: string, room: string) => {
    setUserNameState(name);
    setRoomIdState(room);
    setHasSetDetails(true);
    
    // Update session storage
    const userSession = {
      id: userId,
      color: userColor,
      name: name,
      roomId: room,
    };
    sessionStorage.setItem('tldraw-user-session', JSON.stringify(userSession));
  }, [userId, userColor]);

  const resetUserDetails = useCallback(() => {
    setUserNameState('');
    setRoomIdState('');
    setHasSetDetails(false);
    
    // Clear session storage
    sessionStorage.removeItem('tldraw-user-session');
  }, []);

  return (
    <UserContext.Provider value={{
      userName,
      roomId,
      setUserDetails,
      resetUserDetails,
      hasSetDetails,
      userId,
      userColor,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
