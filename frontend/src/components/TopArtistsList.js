// src/components/TopArtistsList.js
import React from 'react';

const TopArtistsList = ({ topArtists }) => {
  return (
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
  );
};

export default TopArtistsList;
