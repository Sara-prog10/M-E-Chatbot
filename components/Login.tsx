import React, { useState } from 'react';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('admin123');
  const [error, setError] = useState<string>('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      setError('');
      onLoginSuccess();
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background dark:bg-dark-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-sidebar dark:bg-dark-sidebar rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary dark:text-dark-primary">M&E Chatbot Login</h1>
          <p className="mt-2 text-secondary dark:text-dark-secondary">Welcome back. Please login to your account.</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-border dark:border-dark-border placeholder-gray-500 bg-background dark:bg-dark-background text-primary dark:text-dark-primary rounded-t-md focus:outline-none focus:ring-accent dark:focus:ring-dark-accent focus:border-accent dark:focus:border-dark-accent focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password-input" className="sr-only">
                Password
              </label>
              <input
                id="password-input"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-border dark:border-dark-border placeholder-gray-500 bg-background dark:bg-dark-background text-primary dark:text-dark-primary rounded-b-md focus:outline-none focus:ring-accent dark:focus:ring-dark-accent focus:border-accent dark:focus:border-dark-accent focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-accent-hover dark:bg-dark-accent dark:hover:bg-dark-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-dark-accent transition-colors duration-200"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;