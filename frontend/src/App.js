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
  const [showRelated, setShowRelated] = useState(false);
  const [relatedLoading, setRelatedLoading] = useState(false);

  // Parse tokens from URL params on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const rToken = params.get('refresh_token');
    const expires = params.get('expires_in');
    
    // Check for view state in URL
    const view = params.get('view');
    if (view === 'related') {
      setShowRelated(true);
    }

    if (accessToken) {
      setToken(accessToken);
      setRefreshToken(rToken);
      setExpiresIn(Number(expires) || 3600);
      
      // Clear only the token params, preserve view param if needed
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('access_token');
      newUrl.searchParams.delete('refresh_token');
      newUrl.searchParams.delete('expires_in');
      window.history.replaceState({}, document.title, newUrl.toString());
    }
  }, []);

  const refreshAccessToken = useCallback(() => {
    if (!refreshToken) return;

    fetch(`${BACKEND_URL}/refresh_token?refresh_token=${refreshToken}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.access_token) {
          setToken(data.access_token);
          setExpiresIn(data.expires_in || 3600);
          setError(null);
        } else {
          throw new Error('No access token in response');
        }
      })
      .catch((err) => {
        console.error("Token refresh failed:", err);
        setError(`Failed to refresh token: ${err.message}`);
        if (!err.message.includes('Failed to fetch')) {
          setToken(null);
          setRefreshToken(null);
        }
      });
  }, [refreshToken]);

  useEffect(() => {
    if (!expiresIn || !refreshToken) return;

    const refreshTime = (expiresIn - 60) * 1000;
    const timer = setTimeout(() => {
      refreshAccessToken();
    }, refreshTime);

    return () => clearTimeout(timer);
  }, [expiresIn, refreshToken, refreshAccessToken]);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    fetch('https://api.spotify.com/v1/me/top/artists', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) {
            refreshAccessToken();
            throw new Error('Token expired, attempting refresh');
          }
          throw new Error(`Failed to fetch top artists (${res.status})`);
        }
        return res.json();
      })
      .then(data => {
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



  const handleArtistSelect = (artistId) => {
    setSelectedArtistId(artistId);
  };

  const handleLoginClick = () => {
    if (!BACKEND_URL) {
      setError("Backend URL is not configured. Please check your environment variables.");
      return;
    }
    window.location.href = `${BACKEND_URL}/login`;
  };

  const handleShowRelated = async () => {
    try {
      setRelatedLoading(true);
      const allRelated = [];

      for (const artist of topArtists) {
        const response = await fetch(`${BACKEND_URL}/related-artists/${artist.id}?access_token=${token}`);
        if (!response.ok) continue;

        const data = await response.json();
        allRelated.push(...(data.artists || []));
      }

      // Remove duplicates
      const uniqueMap = new Map();
      for (const artist of allRelated) {
        if (!uniqueMap.has(artist.id)) {
          uniqueMap.set(artist.id, artist);
        }
      }

      setRelatedArtists(Array.from(uniqueMap.values()));
      setShowRelated(true);
      
      // Update URL to remember the view state
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('view', 'related');
      window.history.pushState({}, document.title, newUrl.toString());
    } catch (err) {
      console.error("Failed to fetch related artists for all top artists:", err);
    } finally {
      setRelatedLoading(false);
    }
  };


  const handleBackToTop = () => {
    setShowRelated(false);
    
    // Update URL to remember the view state
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('view');
    window.history.pushState({}, document.title, newUrl.toString());
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
          {!showRelated ? (
            <TopArtistsList
              topArtists={topArtists}
              onArtistSelect={handleArtistSelect}
              selectedArtistId={selectedArtistId}
              onShowRelatedArtists={handleShowRelated}
            />
          ) : (
            <RelatedArtistsList
              relatedArtists={relatedArtists}
              onBack={handleBackToTop}
              loading={relatedLoading}
            />
          )}
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
