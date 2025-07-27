// src/components/TopArtistsList.js
import React, { useEffect, useState } from 'react';
import './TopArtistsList.css';

const TopArtistsList = ({ topArtists, onShowRelatedArtists, onShowConcerts }) => {
  const [concertData, setConcertData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConcerts = async () => {
      setLoading(true);
      setError(null);
      const data = {};
      
      for (const artist of topArtists) {
        try {
          // Use the correct backend URL
          const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://vibent-api.onrender.com';
          const url = `${BACKEND_URL}/concerts?artistName=${encodeURIComponent(artist.name)}`;
          
          console.log(`Fetching concerts from: ${url}`);
          const res = await fetch(url);
          
          // Check if response is OK before parsing
          if (!res.ok) {
            console.error(`Error response for ${artist.name}: ${res.status} ${res.statusText}`);
            const text = await res.text();
            console.error(`Response body: ${text.substring(0, 200)}...`);
            throw new Error(`API returned ${res.status}`);
          }
          
          const json = await res.json();
          console.log(`Concert data for ${artist.name}:`, json);
          
          // Make sure we're storing the events array correctly
          if (Array.isArray(json.events)) {
            data[artist.name] = json.events;
            console.log(`Stored ${json.events.length} concerts for ${artist.name}`);
          } else {
            console.warn(`No events array found for ${artist.name}, response:`, json);
            data[artist.name] = [];
          }
        } catch (error) {
          console.error(`Error fetching concerts for ${artist.name}:`, error);
          data[artist.name] = [];
        }
      }
      
      console.log("Final concert data:", data);
      setConcertData(data);
      setLoading(false);
    };

    if (topArtists.length > 0) {
      fetchConcerts();
    }
  }, [topArtists]);

  return (
    <div className="top-artists-container">
      <h1 className="title">Your Top Spotify Artists</h1>
      
      {error && (
        <div className="error-message" style={{ color: 'red', margin: '10px 0' }}>
          Error loading concerts: {error}
        </div>
      )}

      <ul className="artist-list">
        {topArtists.map((artist, index) => (
          <li key={index} className="artist-card">
            <img
              src={artist.images?.[0]?.url}
              alt={artist.name}
              className="artist-img"
            />
            <div>
              <h3 className="artist-name">{artist.name}</h3>
              <p className="artist-popularity">Popularity: {artist.popularity}</p>

              {/* Related Artists */}
              {artist.relatedArtists?.length > 0 && (
                <div className="related-artists">
                  <p className="related-title">Related Artists:</p>
                  <ul className="related-list">
                    {artist.relatedArtists.slice(0, 3).map((rel, i) => (
                      <li key={i} className="related-item">{rel.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Concerts with improved handling */}
              {loading ? (
                <p className="loading-concerts">Loading concerts...</p>
              ) : concertData[artist.name] && concertData[artist.name].length > 0 ? (
                <div className="concerts">
                  <p className="concert-title">Upcoming Concerts:</p>
                  <ul className="concert-list">
                    {concertData[artist.name].slice(0, 2).map((event, i) => (
                      <li key={i} className="concert-item">
                        {event.name} — {event.date} @ {event.venue}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="no-concerts">
                  No concerts found
                  {process.env.NODE_ENV === 'development' && 
                    ` (${concertData[artist.name] ? 'Empty array' : 'No data'})`}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="action-buttons" style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginTop: '30px'
      }}>
        {onShowRelatedArtists && (
          <button
            className="show-related-button"
            onClick={onShowRelatedArtists}
            style={{
              padding: '10px 20px',
              fontSize: '1rem',
              backgroundColor: '#1DB954',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'white'
            }}
          >
            See All Related Artists
          </button>
        )}

        {onShowConcerts && (
          <button
            className="show-concerts-button"
            onClick={onShowConcerts}
            style={{
              padding: '10px 20px',
              fontSize: '1rem',
              backgroundColor: '#191414',
              border: '2px solid #1DB954',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'white'
            }}
          >
            Find All Concerts
          </button>
        )}
      </div>
    </div>
  );
};

export default TopArtistsList;