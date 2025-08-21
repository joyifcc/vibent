import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginButton from './components/LoginButton';
import TopArtistsList from './components/TopArtistsList';
import RelatedArtistsList from './components/RelatedArtistsList';
import ConcertFinder from './components/ConcertFinder';
import FlightDetails from './components/FlightDetails';

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
  const [showConcerts, setShowConcerts] = useState(false);

  // -----------------------
  // Token handling on mount
  // -----------------------
  useEffect(() => {
    // 1. Parse query params and hash params
    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace('#', ''));
    const accessToken = params.get('access_token') || hash.get('access_token');
    const rToken = params.get('refresh_token') || hash.get('refresh_token');
    const expires = params.get('expires_in') || hash.get('expires_in');
    const view = params.get('view');

    if (view === 'related') setShowRelated(true);
    else if (view === 'concerts') setShowConcerts(true);

    if (accessToken) {
      setToken(accessToken);
      setRefreshToken(rToken);
      setExpiresIn(Number(expires) || 3600);

      // Remove token from URL for cleanliness
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('access_token');
      newUrl.searchParams.delete('refresh_token');
      newUrl.searchParams.delete('expires_in');
      window.history.replaceState({}, document.title, newUrl.toString());
      // Clear hash too
      window.location.hash = '';
    }
  }, []);

  // -----------------------
  // Refresh token logic
  // -----------------------
  const refreshAccessToken = useCallback(() => {
    if (!refreshToken) return;
    fetch(`${BACKEND_URL}/refresh_token?refresh_token=${refreshToken}`)
      .then(res => res.json())
      .then(data => {
        if (data.access_token) {
          setToken(data.access_token);
          setExpiresIn(data.expires_in || 3600);
        }
      })
      .catch(err => console.error("Token refresh failed:", err));
  }, [refreshToken]);

  useEffect(() => {
    if (!expiresIn || !refreshToken) return;
    const refreshTime = (expiresIn - 60) * 1000;
    const timer = setTimeout(refreshAccessToken, refreshTime);
    return () => clearTimeout(timer);
  }, [expiresIn, refreshToken, refreshAccessToken]);

  // -----------------------
  // Load top artists
  // -----------------------
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch('https://api.spotify.com/v1/me/top/artists', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setTopArtists(data.items || []);
        if (data.items?.length) setSelectedArtistId(data.items[0].id);
      })
      .catch(err => console.error("Error fetching top artists:", err))
      .finally(() => setLoading(false));
  }, [token]);

  // -----------------------
  // Handlers
  // -----------------------
  const handleArtistSelect = (artistId) => setSelectedArtistId(artistId);
  const handleLoginClick = () => window.location.href = `${BACKEND_URL}/login`;
  const handleShowRelated = useCallback(() => { /* your existing code */ }, [token, topArtists, BACKEND_URL]);
  const handleShowConcerts = () => { setShowConcerts(true); setShowRelated(false); };
  const handleBackToTop = () => { setShowRelated(false); setShowConcerts(false); };

  // -----------------------
  // Render
  // -----------------------
  if (!token) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #191414, #1DB954)',
        fontFamily: 'Helvetica, sans-serif',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(0, 0, 0, 0.75)',
          padding: '60px 40px',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          color: 'white'
        }}>
          <h1 style={{ fontSize: '4rem', marginBottom: '15px', letterSpacing: '2px' }}>Vibent</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '40px', lineHeight: '1.6', color: '#ddd' }}>
            Discover your top artists, find concerts, and plan your travel — all in one place.
          </p>
          <LoginButton
            onClick={handleLoginClick}
            backendUrl={BACKEND_URL}
            style={{
              padding: '15px 40px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              borderRadius: '50px',
              background: 'linear-gradient(to right, #1DB954, #1ed760)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease-in-out',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          />
        </div>
      </div>
    );
  }
  

  return (
    <Router>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #191414, #1DB954)',
        fontFamily: 'Helvetica, sans-serif',
        color: 'white'
      }}>
        <Routes>
          {/* Homepage */}
          <Route
            path="/"
            element={
              !showRelated && !showConcerts ? (
                <TopArtistsList
                  topArtists={topArtists}
                  onArtistSelect={handleArtistSelect}
                  selectedArtistId={selectedArtistId}
                  onShowRelatedArtists={handleShowRelated}
                  onShowConcerts={handleShowConcerts}
                />
              ) : showRelated ? (
                <RelatedArtistsList
                  relatedArtists={relatedArtists}
                  onBack={handleBackToTop}
                  loading={relatedLoading}
                />
              ) : (
                <ConcertFinder
                  artists={[...topArtists, ...relatedArtists]}
                  onBack={handleBackToTop}
                  token={token}
                  backendUrl={BACKEND_URL}
                />
              )
            }
          />

          {/* Flight Details Page */}
          <Route
            path="/flights/:eventId"
            element={
              <FlightDetails
                originAirport="SFO"
                normalizedStateToAirports={{}}
              />
            }
          />
        </Routes>

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
    </Router>
  );
}

export default App;
