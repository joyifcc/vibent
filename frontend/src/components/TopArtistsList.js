// src/components/TopArtistsList.js
import React, { useEffect, useState } from 'react';
import './TopArtistsList.css';

const TopArtistsList = ({ topArtists, onShowRelatedArtists, onShowConcerts }) => {
  const [concertData, setConcertData] = useState({});
  const [expandedArtists, setExpandedArtists] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationFilter, setLocationFilter] = useState('');

  const toggleExpanded = (artistName) => {
    setExpandedArtists(prev => ({
      ...prev,
      [artistName]: !prev[artistName]
    }));
  };

  useEffect(() => {
    const fetchConcerts = async () => {
      setLoading(true);
      setError(null);
      const data = {};

      for (const artist of topArtists) {
        try {
          const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://vibent-api.onrender.com';
          const url = `${BACKEND_URL}/concerts?artistName=${encodeURIComponent(artist.name)}`;
          const res = await fetch(url);

          if (!res.ok) {
            const text = await res.text();
            throw new Error(`API returned ${res.status}: ${text}`);
          }

          const json = await res.json();
          data[artist.name] = Array.isArray(json.events) ? json.events : [];
        } catch (error) {
          data[artist.name] = [];
          console.error(`Concert fetch error for ${artist.name}:`, error);
        }
      }

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

      {/* Location Filter */}
      <div style={{ margin: '20px 0', textAlign: 'center' }}>
        <input
          type="text"
          placeholder="Filter by City or State (e.g. New York)"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          style={{
            padding: '10px',
            fontSize: '1rem',
            borderRadius: '8px',
            border: '1px solid #ccc',
            width: '250px'
          }}
        />
      </div>

      {error && (
        <div className="error-message" style={{ color: 'red', margin: '10px 0' }}>
          Error loading concerts: {error}
        </div>
      )}

      <ul className="artist-list">
        {topArtists.map((artist, index) => {
          const concerts = concertData[artist.name] || [];

          const filteredConcerts = concerts.filter(event => {
            const query = locationFilter.toLowerCase();
            return (
              !locationFilter ||
              (event.city && event.city.toLowerCase().includes(query)) ||
              (event.state && event.state.toLowerCase().includes(query)) ||
              (event.country && event.country.toLowerCase().includes(query)) ||
              (event.venue && event.venue.toLowerCase().includes(query)) ||
              (event.name && event.name.toLowerCase().includes(query)) // catches festivals/tours
            );
          });
          
          

          return (
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

                {/* Concerts */}
                {loading ? (
                  <p className="loading-concerts">Loading concerts...</p>
                ) : filteredConcerts.length > 0 ? (
                  <>
                    <button
                      onClick={() => toggleExpanded(artist.name)}
                      style={{
                        marginTop: '10px',
                        backgroundColor: '#1DB954',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      {expandedArtists[artist.name] ? 'Hide Concerts' : 'Show All Concerts'}
                    </button>

                    {expandedArtists[artist.name] ? (
                      <ul className="concert-list" style={{ marginTop: '10px' }}>
                        {filteredConcerts.map((event, i) => (
                          <li key={i} className="concert-item">
                          <a
                            href={event.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#1DB954', textDecoration: 'underline' }}
                          >
                            {event.name}
                          </a> — {event.date} @ {event.venue}
                        </li>
                        
                        ))}
                      </ul>
                    ) : (
                      <ul className="concert-list" style={{ marginTop: '10px' }}>
                        {filteredConcerts.slice(0, 2).map((event, i) => (
                          <li key={i} className="concert-item">
                          <a
                            href={event.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#1DB954', textDecoration: 'underline' }}
                          >
                            {event.name}
                          </a> — {event.date} @ {event.venue}
                        </li>
                        
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <p className="no-concerts">No concerts found</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Bottom Buttons */}
      <div className="action-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
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
