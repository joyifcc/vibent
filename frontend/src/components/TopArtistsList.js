// src/components/TopArtistsList.js
import React, { useEffect, useState } from 'react';
import './TopArtistsList.css';

const TopArtistsList = ({ topArtists, onShowRelatedArtists, onShowConcerts }) => {
  const [concertData, setConcertData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchConcerts = async () => {
      setLoading(true);
      const data = {};
      for (const artist of topArtists) {
        try {
          const res = await fetch(`/api/concerts?artistName=${encodeURIComponent(artist.name)}`);
          const json = await res.json();
          console.log(`Concert data for ${artist.name}:`, json); // Debug log
          data[artist.name] = json?.events || [];
        } catch (error) {
          console.error(`Error fetching concerts for ${artist.name}:`, error);
          data[artist.name] = [];
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

              {/* Concerts */}
              {loading ? (
                <p className="loading-concerts">Loading concerts...</p>
              ) : concertData[artist.name]?.length > 0 ? (
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
                <p className="no-concerts">No concerts found</p>
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