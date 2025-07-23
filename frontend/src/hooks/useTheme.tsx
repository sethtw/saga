import { useState, useEffect, useMemo } from 'react';
import { darkTheme, lightTheme, type Theme } from '../styles/themes';

export const useTheme = (): [Theme, () => void] => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = window.localStorage.getItem('theme') as 'dark' | 'light' | null;
    return savedTheme || 'dark';
  });

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    window.localStorage.setItem('theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const currentTheme = useMemo(() => (theme === 'light' ? lightTheme : darkTheme), [theme]);

  return [currentTheme, toggleTheme];
}; 