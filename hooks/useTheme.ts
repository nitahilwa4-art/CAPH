
import { useEffect } from 'react';
import { User } from '../types';

export const useTheme = (user: User | null) => {
  useEffect(() => {
    if (user?.preferences?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user?.preferences?.theme]);
};
