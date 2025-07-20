import React, { useEffect, useState, useCallback } from 'react';
import LoginButton from './components/LoginButton';
import TopArtistsList from './components/TopArtistsList';
import RelatedArtistsList from './components/RelatedArtistsList';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://vibent-api.onrender.com';

function App() {
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [expiresIn, setExpiresIn] = useState(null);
  const [topArtists, setTopArtists] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedArtistId, setSelectedArtistId] = useState(null);
  const [relatedArtists, setRelatedArtists] = useState([]);

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

  // Fetch related artists when selectedArtistId changes
  useEffect(() => {
    if (!token || !selectedArtistId) return;

    console.log(`Fetching related artists for ${selectedArtistId}...`);
    fetch(`${BACKEND_URL}/related-artists/${selectedArtistId}?access_token=${token}`)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch related artists (${res.status})`);
        return res.json();
      })
      .then(data => {
        console.log(`Received ${data.artists?.length || 0} related artists`);
        setRelatedArtists(data.artists || []);
      })
      .catch(err => {
        console.error("Error fetching related artists:", err);
        setRelatedArtists([]);
      });
  }, [token, selectedArtistId]);

  const handleArtistSelect = (artistId) => {
    console.log(`Selected artist: ${artistId}`);
    setSelectedArtistId(artistId);
  };

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
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #191414, #1DB954)',
      fontFamily: 'Arial, sans-serif',
      color: 'white'
    }}>
      {!token ? (
        <LoginButton onClick={handleLoginClick} backendUrl={BACKEND_URL} />
      ) : (
        <>
          <TopArtistsList 
            topArtists={topArtists} 
            onArtistSelect={handleArtistSelect}
            selectedArtistId={selectedArtistId}
          />
          <RelatedArtistsList relatedArtists={relatedArtists} />
        </>
      )}
      
      {error && (
        <div style={{
          background: 'rgba(255, 0, 0, 0.2)',
          padding: '10px 20px',
          borderRadius: '5px',
          margin: '20px 0',
          maxWidth: '80%'
        }}>
          <p>Error: {error}</p>
        </div>
      )}
    </div>
  );  
}

export default App;