import React, { useState, useEffect } from 'react';
import './login.css'
import logo from './assets/images/eaststone.png'
const API_URL = import.meta.env.VITE_API_URL || "http://192.168.8.171:5000";

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const { userId, userName } = JSON.parse(loggedInUser);
      onLogin(userId, userName);
    }
  }, [onLogin]);

  const handleLogin = async (e) => {
    e.preventDefault();

    
    try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      setErrorMessage(data.error || "Login failed");
      return;
    }
    
    
      // Save the user data to localStorage
      const userData = { userId: data.userId, userName: data.userName, token: data.token };
      localStorage.setItem('user', JSON.stringify(userData));

      // Call onLogin function with user data
      onLogin(data.userId, data.username);
    } catch (err){
        console.error(err);
        setErrorMessage("Network error");

    }

  };

  return (

    <div>
      <div className = "background"></div>
      <form onSubmit={handleLogin} className = "login-box">

        <img src={logo} alt="Logo"/>
        <div>
          <label>Användarem: </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label>Lösenord: </label>
          <input
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
