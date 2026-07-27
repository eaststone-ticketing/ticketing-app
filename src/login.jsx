import React, { useState, useEffect } from 'react';
import './login.css'
import logo from './assets/images/eaststone.png'
import { getToken, logout, scheduleSessionExpiryCheck } from './Helpers/auth.js'
const API_URL = import.meta.env.VITE_API_URL || "http://192.168.8.171:5000";

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function restoreSession() {
      const loggedInUser = localStorage.getItem('user');
      if (!loggedInUser) {
        return;
      }

      const { userId, userName, token } = JSON.parse(loggedInUser);
      if (!token) {
        logout();
        return;
      }

      const validToken = await getToken();
      if (!validToken) {
        return;
      }

      onLogin(userId, userName);
    }

    restoreSession();
  }, [onLogin]);

  const handleLogin = async (e) => {
    e.preventDefault();

    
    try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: 'include',  // <-- This ensures cookies are sent with the request
    });

    const data = await res.json();

    if (!res.ok) {
      setErrorMessage(data.error || "Login failed");
      return;
    }
    
    
      // Save the user data to localStorage
      const userData = { userId: data.userId, userName: data.userName, token: data.token };
      localStorage.setItem('user', JSON.stringify(userData));

      scheduleSessionExpiryCheck(data.token);
      onLogin(data.userId, data.username);
    } catch (err){
        console.error(err);
        setErrorMessage("Network error");

    }

  };

  return (

    <div className = "login-page">
      <div className = "background"></div>
      <form onSubmit={handleLogin} className = "login-box">

        <img src={logo} alt="Logo"/>
        <div className = "login-field">
          <label htmlFor = "username">Användare</label>
          <input
            id = "username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className = "login-field">
          <label htmlFor = "password">Lösenord</label>
          <input
            id = "password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
}

export default Login;
