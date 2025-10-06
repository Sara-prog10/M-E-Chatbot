import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Chat from './components/Chat';

export type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>(localStorage.getItem('theme') as Theme || 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };
  
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen font-sans text-primary dark:text-dark-primary bg-background dark:bg-dark-background transition-colors duration-300">
      {isLoggedIn ? <Chat onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} /> : <Login onLoginSuccess={handleLoginSuccess} />}
    </div>
  );
};

export default App;