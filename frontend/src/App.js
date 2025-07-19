import React, { useEffect, useState } from 'react';
import RelatedArtists from './RelatedArtists';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://vibent-api.onrender.com';

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
    console.log("App mounted, checking for tokens in URL");
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const rToken = params.get('refresh_token');
    const expires = params.get('expires_in');

    if (accessToken) {
      console.log("Token received from URL params");
      setToken(accessToken);
      setRefreshToken(rToken);
      setExpiresIn(Number(expires) || 3600);
      
      // Clear the URL parameters without reloading the page
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  // Refresh access token before expiration
  const refreshAccessToken = useCallback(() => {
    if (!refreshToken) return;

    console.log("Attempting to refresh token...");
    fetch(`${BACKEND_URL}/refresh_token?refresh_token=${refreshToken}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.access_token) {
          console.log("Token refreshed successfully");
          setToken(data.access_token);
          // Reset expiry timer to 1 hour or whatever Spotify returns (if provided)
          setExpiresIn(data.expires_in || 3600);
          setError(null);
        } else {
          throw new Error('No access token in response');
        }
      })
      .catch((err) => {
        console.error("Token refresh failed:", err);
        setError(`Failed to refresh token: ${err.message}`);
        // Don't clear tokens on network errors to allow retries
        if (!err.message.includes('Failed to fetch')) {
          setToken(null);
          setRefreshToken(null);
        }
      });
  }, [refreshToken]);

  // Setup interval to refresh token 1 min before expiry
  useEffect(() => {
    if (!expiresIn || !refreshToken) return;

    const refreshTime = (expiresIn - 60) * 1000; // ms
    console.log(`Token will refresh in ${refreshTime/1000} seconds`);

    const timer = setTimeout(() => {
      refreshAccessToken();
    }, refreshTime);

    return () => clearTimeout(timer);
  }, [expiresIn, refreshToken, refreshAccessToken]);

  // Fetch top artists when token changes
  useEffect(() => {
    if (!token) return;

    setLoading(true);
    console.log("Fetching top artists...");
    fetch('https://api.spotify.com/v1/me/top/artists', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) {
            // Token expired, try to refresh
            refreshAccessToken();
            throw new Error('Token expired, attempting refresh');
          }
          throw new Error(`Failed to fetch top artists (${res.status})`);
        }
        return res.json();
      })
      .then(data => {
        console.log(`Received ${data.items?.length || 0} top artists`);
        setTopArtists(data.items || []);
        setError(null);
        if (data.items && data.items.length) {
          setSelectedArtistId(data.items[0].id);
        }
      })
      .catch(err => {
        console.error("Error fetching top artists:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [token, refreshAccessToken]);

  const handleLoginClick = () => {
    if (!BACKEND_URL) {
      setError("Backend URL is not configured. Please check your environment variables.");
      return;
    }
    console.log(`Redirecting to ${BACKEND_URL}/login`);
    window.location.href = `${BACKEND_URL}/login`;
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      {!token ? (
        <div>
          <h1>Welcome to Vibent</h1>
          <p>Discover your music taste and find related artists</p>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button
            onClick={handleLoginClick}
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
        </div>
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