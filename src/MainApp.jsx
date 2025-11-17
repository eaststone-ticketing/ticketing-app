import { useState } from 'react';
import App from './App.jsx';
import Login from './login.jsx';

function MainApp() {
    console.log("Anything")
  const [user, setUser] = useState(null);

  // Handle login and set user
  function handleLogin(userid, userName) {
    setUser({ id: userid, name: userName });
  }

  return (
    <>
      {/* Conditionally render the Login component or App based on user state */}
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <App user = {user} />
      )}
    </>
  );
}

export default MainApp;
