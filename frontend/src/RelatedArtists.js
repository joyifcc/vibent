import React, { useEffect, useState } from 'react';
import RelatedArtists from './RelatedArtists';

function App() {
  const [token, setToken] = useState('');
  const [selectedArtistId, setSelectedArtistId] = useState('');

  useEffect(() => {
    const hash = window.location.hash;
    const tokenFromUrl = hash.match(/access_token=([^&]*)/)?.[1];
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      window.location.hash = '';
    }
  }, []);

  const handleSelectArtist = (id) => {
    setSelectedArtistId(id);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>My Spotify Dashboard</h1>

      {!token ? (
        <a
          href={`https://your-backend.onrender.com/login`}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1DB954',
            color: 'white',
            borderRadius: 25,
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          Login with Spotify
        </a>
      ) : (
        <>
          {/* Example hardcoded artist ID for testing */}
          <button
            onClick={() => handleSelectArtist('1uNFoZAHBGtllmzznpCI3s')} // Justin Bieber ID
            style={{
              margin: '20px 0',
              padding: '10px 20px',
              borderRadius: 10,
              backgroundColor: '#333',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Show Related Artists for Justin Bieber
          </button>

          {selectedArtistId && (
            <RelatedArtists artistId={selectedArtistId} accessToken={token} />
          )}
        </>
      )}
    </div>
  );
}

export default App;
