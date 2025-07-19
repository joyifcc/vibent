import React, { useEffect, useState } from 'react';
import RelatedArtists from './RelatedArtists';
import { useCallback } from 'react';

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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'linear-gradient(to bottom, #191414, #1DB954)',
      fontFamily: 'Arial, sans-serif',
      color: 'white'
    }}>
      {!token ? (
        <a
          href={`${BACKEND_URL}/login`}
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
  ) : (
    <>
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
    backgroundColor: '#121212',
    minHeight: '100vh',
    color: '#fff',
    fontFamily: 'Helvetica, Arial, sans-serif'
  }}>
    <h1 style={{
      fontSize: '2rem',
      marginBottom: '30px',
      borderBottom: '2px solid #1DB954',
      paddingBottom: '10px',
      textAlign: 'center'
    }}>
      Your Top Spotify Artists
    </h1>

    <ul style={{
      listStyle: 'none',
      padding: 0,
      width: '100%',
      maxWidth: '700px',
    }}>
      {topArtists.map((artist, index) => (
        <li key={index} style={{
          background: '#1e1e1e',
          borderRadius: '16px',
          margin: '15px 0',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          cursor: 'pointer'
        }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
          }}
        >
          <img
            src={artist.images?.[0]?.url}
            alt={artist.name}
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '12px',
              objectFit: 'cover'
            }}
          />
          <div>
            <h3 style={{ margin: '0 0 6px', fontSize: '1.2rem' }}>{artist.name}</h3>
            <p style={{ margin: 0, color: '#a7a7a7', fontSize: '0.95rem' }}>
              Popularity: {artist.popularity}
            </p>
          </div>
        </li>
      ))}
    </ul>
  </div>
</>

  )}
</div>
  );
  
}

export default App;