// src/components/LoginButton.js
import React from 'react';

const LoginButton = ({ onClick, backendUrl }) => {
  return (
    <a
      href={`${backendUrl}/login`}
      onClick={onClick}
      style={{
        padding: '15px 30px',
        backgroundColor: '#1DB954',
        color: '#fff',
        borderRadius: '50px',
        textDecoration: 'none',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease-in-out'
      }}
      onMouseOver={(e) => e.target.style.opacity = 0.85}
      onMouseOut={(e) => e.target.style.opacity = 1}
    >
      Login with Spotify
    </a>
  );
};

export default LoginButton;
