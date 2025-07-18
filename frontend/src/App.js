import React, { useEffect, useState } from 'react';
import RelatedArtists from './RelatedArtists';

function App() {
  const [token, setToken] = useState(null);
  const [topArtists, setTopArtists] = useState([]);
  const [error, setError] = useState(null);
  const [selectedArtistId, setSelectedArtistId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    if (accessToken) {
      setToken(accessToken);
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    fetch('https://api.spotify.com/v1/me/top/artists', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch top artists');
        return res.json();
      })
      .then(data => {
        setTopArtists(data.items || []);
        setError(null);
        if (data.items && data.items.length) {
          setSelectedArtistId(data.items[0].id); // select first artist by default
        }
      })
      .catch(err => setError(err.message));
  }, [token]);

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      {!token ? (
        <a
          href="https://vibent-api.onrender.com/login"
          style={{
            padding: '10px 20px',
            backgroundColor: '#1DB954',
            color: 'white',
            borderRadius: 25,
            textDecoration: 'none',
            fontWeight: 'bold',
            display: 'inline-block',
          }}
        >
          Login with Spotify
        </a>
      ) : (
        <>
          <h1>Your Top Spotify Artists</h1>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <ul>
            {topArtists.map(artist => (
              <li
                key={artist.id}
                style={{
                  cursor: 'pointer',
                  fontWeight: selectedArtistId === artist.id ? 'bold' : 'normal',
                  marginBottom: 8,
                }}
                onClick={() => setSelectedArtistId(artist.id)}
              >
                {artist.name}
              </li>
            ))}
          </ul>

          {selectedArtistId && (
            <RelatedArtists artistId={selectedArtistId} accessToken={token} />
          )}
        </>
      )}
    </div>
  );
}

export default App;
