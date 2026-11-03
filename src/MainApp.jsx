import { useState } from 'react';
import App from './App.jsx';
import Login from './login.jsx';
import {useIsMobile} from "./useIsMobile.js"; 
import MobileApp from "./MobileApp/MobileApp.jsx"; 

function MainApp() {
    console.log("Anything")
  const [user, setUser] = useState(null);
  const isMobile = useIsMobile();

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
        isMobile ?
        <MobileApp user = {user} /> :
        <App user = {user} />
        
      )}
    </>
  );
}

export default MainApp;
