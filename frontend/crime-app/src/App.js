import React, { createContext, useState, useEffect } from 'react';
import './App.css';
import Login from './Login';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './Dashboard';

export const UserContext = createContext();

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    console.log('App.js user state:', user);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const logout = () => {
    console.log('Logout called'); // Debug logout
    setUser(null); // Clear user state
    localStorage.removeItem('user'); // Clear localStorage
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </Router>
    </UserContext.Provider>
  );
}

export default App;