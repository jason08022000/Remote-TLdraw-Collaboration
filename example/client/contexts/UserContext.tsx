import { createContext, useContext, useState, useCallback, PropsWithChildren } from 'react';

interface UserContextType {
  userName: string;
  setUserName: (name: string) => void;
  hasSetName: boolean;
  userId: string;
  userColor: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: PropsWithChildren) {
  const [userName, setUserNameState] = useState('');
  const [hasSetName, setHasSetName] = useState(false);

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

  const setUserName = useCallback((name: string) => {
    setUserNameState(name);
    setHasSetName(true);
    
    // Update session storage
    const userSession = {
      id: userId,
      color: userColor,
      name: name,
    };
    sessionStorage.setItem('tldraw-user-session', JSON.stringify(userSession));
  }, [userId, userColor]);

  return (
    <UserContext.Provider value={{
      userName,
      setUserName,
      hasSetName,
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
