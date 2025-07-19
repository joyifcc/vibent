import React, { useEffect, useState, useCallback } from 'react';
import RelatedArtists from './RelatedArtists';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [expiresIn, setExpiresIn] = useState(null);
  const [topArtists, setTopArtists] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedArtistId, setSelectedArtistId] = useState(null);

  // Parse tokens from URL params on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const rToken = params.get('refresh_token');
    const expires = params.get('expires_in');

    if (accessToken) {
      setToken(accessToken);
      setRefreshToken(rToken);
      setExpiresIn(Number(expires));
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  // Refresh access token before expiration
  const refreshAccessToken = useCallback(() => {
    if (!refreshToken) return;

    fetch(`${BACKEND_URL}/refresh_token?refresh_token=${refreshToken}`)
      .then(res => res.json())
      .then(data => {
        if (data.access_token) {
          setToken(data.access_token);
          // Reset expiry timer to 1 hour or whatever Spotify returns (if provided)
          setExpiresIn(3600);
          setError(null);
        } else {
          setError('Failed to refresh token');
          setToken(null);
          setRefreshToken(null);
        }
      })
      .catch(() => {
        setError('Failed to refresh token');
        setToken(null);
        setRefreshToken(null);
      });
  }, [refreshToken]);

  // Setup interval to refresh token 1 min before expiry
  useEffect(() => {
    if (!expiresIn) return;

    const refreshTime = (expiresIn - 60) * 1000; // ms

    const timer = setTimeout(() => {
      refreshAccessToken();
    }, refreshTime);

    return () => clearTimeout(timer);
  }, [expiresIn, refreshAccessToken]);

  // Fetch top artists when token changes
  useEffect(() => {
    if (!token) return;

    setLoading(true);
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
          setSelectedArtistId(data.items[0].id);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      {!token ? (
        <button
        onClick={() => {
          window.location.href = `${BACKEND_URL}/login`;
        }}
        style={{
          padding: '10px 20px',
          backgroundColor: '#1DB954',
          color: 'white',
          borderRadius: 25,
          fontWeight: 'bold',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Login with Spotify
      </button>
      
      ) : (
        <>
          <h1>Your Top Spotify Artists</h1>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {loading ? (
            <p>Loading your top artists...</p>
          ) : (
            <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
              {topArtists.map(artist => (
                <li key={artist.id} style={{ marginBottom: 8 }}>
                  <button
                    onClick={() => setSelectedArtistId(artist.id)}
                    style={{
                      cursor: 'pointer',
                      fontWeight: selectedArtistId === artist.id ? 'bold' : 'normal',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: '1em',
                      fontFamily: 'inherit',
                      color: 'blue',
                      textDecoration: 'underline',
                    }}
                    aria-pressed={selectedArtistId === artist.id}
                  >
                    {artist.name}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selectedArtistId && (
            <RelatedArtists artistId={selectedArtistId} accessToken={token} />
          )}
        </>
      )}
    </div>
  );
}

export default App;
