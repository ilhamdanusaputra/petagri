import { useCallback, useState } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate login delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Dummy user based on email
      setUser({
        id: '1',
        email,
        name: email.split('@')[0],
      });
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return {
    user,
    isLoading,
    login,
    logout,
    isLoggedIn: user !== null,
  };
}
