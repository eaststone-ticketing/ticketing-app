import React, { useState } from 'react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();


    //FIX: This is obviously ridiculously unsafe

    if (username === 'felix' && password === "123") {
        onLogin({ id: 1, username: 'felix'})
    }

    if (username === 'ieva' && password === 'fikavarjedag') {
      // If login is successful, call the onLogin function with the user ID or data
      onLogin({ id: 2, username: 'ieva' });
    } 

    else {
      // If login fails, set an error message
      setErrorMessage('Invalid username or password');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label>Password:</label>
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
