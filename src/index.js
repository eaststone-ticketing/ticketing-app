import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';  // If you have a CSS file
import MainApp from './MainApp.jsx';  // Your main app component

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>
);
