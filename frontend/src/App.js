import React, { useEffect, useState, useCallback } from 'react';
import LoginButton from './components/LoginButton';
import TopArtistsList from './components/TopArtistsList';
import RelatedArtistsList from './components/RelatedArtistsList';
import ConcertFinder from './components/ConcertFinder'; // Import ConcertFinder

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
  const [showConcerts, setShowConcerts] = useState(false); // Add state for concert view

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
  } else if (view === 'concerts') {
    setShowConcerts(true);
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

  const handleShowRelated = useCallback(async () => {
    try {
      setRelatedLoading(true);
      setError(null); // Clear any previous errors
      
      // Try direct Spotify API call first as a test
      console.log("Testing direct Spotify API call...");
      try {
        const directResponse = await fetch('https://api.spotify.com/v1/artists/3TVXtAsR1Inumwj472S9r4/related-artists', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`Direct Spotify API call status: ${directResponse.status}`);
        
        if (directResponse.ok) {
          const directData = await directResponse.json();
          console.log(`Direct call successful! Found ${directData.artists?.length} related artists`);
        } else {
          const directErrorText = await directResponse.text();
          console.error(`Direct call failed: ${directErrorText}`);
        }
      } catch (directErr) {
        console.error("Direct API call failed:", directErr);
      }
      
      // Print backend URL for verification
      console.log(`Using backend URL: ${BACKEND_URL}`);
      
      // Test backend root endpoint to verify connectivity
      try {
        const rootResponse = await fetch(`${BACKEND_URL}/`);
        console.log(`Backend root endpoint status: ${rootResponse.status}`);
        if (rootResponse.ok) {
          const rootText = await rootResponse.text();
          console.log(`Backend root response: ${rootText}`);
        }
      } catch (rootErr) {
        console.error("Backend connectivity test failed:", rootErr);
      }
      
      // Try with explicit encoding of the ID
      const drakeId = encodeURIComponent("3TVXtAsR1Inumwj472S9r4");
      console.log(`Testing with URL-encoded Drake ID: ${drakeId}`);
      
      try {
        const encodedResponse = await fetch(`${BACKEND_URL}/related-artists/${drakeId}?access_token=${encodeURIComponent(token)}`);
        console.log(`Encoded request status: ${encodedResponse.status}`);
        
        if (encodedResponse.ok) {
          const encodedData = await encodedResponse.json();
          console.log(`Encoded request successful! Found ${encodedData.artists?.length} related artists`);
        } else {
          const encodedErrorText = await encodedResponse.text();
          console.error(`Encoded request failed: ${encodedErrorText}`);
        }
      } catch (encodedErr) {
        console.error("Encoded request failed:", encodedErr);
      }
      
      console.log("Fetching related artists for top artists...");
      let allRelatedArtists = [];
      
      // Use direct Spotify API as a fallback if backend route is failing
      const useDirectApi = true; // Set to true to bypass your backend
      
      // Take only the first 5 top artists to avoid making too many requests
      const artistsToProcess = topArtists.slice(0, 5);
      
      for (const artist of artistsToProcess) {
        // Log the exact URL and artist ID
        const requestUrl = `${BACKEND_URL}/related-artists/${artist.id}?access_token=${token}`;
        console.log(`Making request to: ${requestUrl}`);
        console.log(`Artist ID: "${artist.id}" for artist "${artist.name}"`);
        
        try {
          const response = await fetch(requestUrl);
          
          console.log(`Response status for ${artist.name}: ${response.status}`);
          
          if (!response.ok) {
            console.error(`Failed request for ${artist.name}. Status: ${response.status}`);
            // Log the response body for more details
            try {
              const errorBody = await response.text();
              console.error(`Error response body: ${errorBody}`);
            } catch (e) {
              console.error("Couldn't read error response body");
            }
            
            if (response.status === 404) {
              console.log(`No artist found with ID ${artist.id} (${artist.name}). Skipping.`);
            }
            continue;
          }
          
          const data = await response.json();
          console.log(`Found ${data.artists?.length || 0} related artists for ${artist.name}`);
          
          if (data.artists && data.artists.length > 0) {
            // Take top 3 related artists from each
            const top3Related = data.artists.slice(0, 3);
            allRelatedArtists = [...allRelatedArtists, ...top3Related];
          }
        } catch (artistError) {
          console.error(`Error processing ${artist.name}:`, artistError);
          // Continue to the next artist
        }
      }
      
      // Remove duplicates
      const uniqueArtistsMap = new Map();
      allRelatedArtists.forEach(artist => {
        if (!uniqueArtistsMap.has(artist.id)) {
          uniqueArtistsMap.set(artist.id, artist);
        }
      });
      
      const uniqueArtists = Array.from(uniqueArtistsMap.values());
      console.log(`Total unique related artists found: ${uniqueArtists.length}`);
      
      setRelatedArtists(uniqueArtists);
      setShowRelated(true);
      
      // Update URL to remember the view state
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('view', 'related');
      window.history.pushState({}, document.title, newUrl.toString());
    } catch (err) {
      console.error("Error in handleShowRelated:", err);
      setError(`Failed to fetch related artists: ${err.message}`);
    } finally {
      setRelatedLoading(false);
    }
  }, [token, topArtists, BACKEND_URL]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    
    if (view === 'related' && token && topArtists.length > 0 && !relatedArtists.length) {
      console.log("View parameter is 'related', fetching related artists...");
      handleShowRelated();
    }
  }, [token, topArtists, relatedArtists.length, handleShowRelated]);

const handleShowConcerts = () => {
  setShowConcerts(true);
  setShowRelated(false);
  
  // Update URL to remember view state
  const newUrl = new URL(window.location.href);
  newUrl.searchParams.set('view', 'concerts');
  window.history.pushState({}, document.title, newUrl.toString());
};

const handleBackToTop = () => {
  setShowRelated(false);
  setShowConcerts(false);
  
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
        {!showRelated && !showConcerts ? (
          <TopArtistsList
            topArtists={topArtists}
            onArtistSelect={handleArtistSelect}
            selectedArtistId={selectedArtistId}
            onShowRelatedArtists={handleShowRelated}
            onShowConcerts={handleShowConcerts} // Add this prop
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