// src/components/TopArtistsList.js
import React from 'react';
import './TopArtistsList.css'; // External styles

const TopArtistsList = ({ topArtists, onShowRelatedArtists }) => {
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
            </div>
          </li>
        ))}
      </ul>

      {onShowRelatedArtists && (
        <button
          className="show-related-button"
          onClick={onShowRelatedArtists}
          style={{
            marginTop: '30px',
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
    </div>
  );
};

export default TopArtistsList;
