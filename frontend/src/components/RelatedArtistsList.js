// src/components/RelatedArtistsList.js
import React from 'react';

const RelatedArtistsList = ({ relatedArtists, onBack }) => {
  console.log("RelatedArtistsList rendered with:", { 
    relatedArtistsLength: relatedArtists?.length,
    hasOnBack: !!onBack
  });

  if (!relatedArtists || !relatedArtists.length) {
    return (
      <div style={{ padding: '40px 20px', backgroundColor: '#181818' }}>
        <button
          onClick={onBack}
          style={{
            background: 'transparent',
            border: '1px solid #1DB954',
            color: '#1DB954',
            padding: '8px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            cursor: 'pointer'
          }}
        >
          ← Back to Top Artists
        </button>

        <h2 style={{
          fontSize: '1.8rem',
          marginBottom: '25px',
          borderBottom: '2px solid #1DB954',
          paddingBottom: '8px',
          textAlign: 'center'
        }}>
          No Related Artists Found
        </h2>
        <p style={{ textAlign: 'center', color: '#aaa' }}>
          We couldn't find any related artists. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#181818' }}>
      <button
        onClick={onBack}
        style={{
          background: 'transparent',
          border: '1px solid #1DB954',
          color: '#1DB954',
          padding: '8px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          cursor: 'pointer'
        }}
      >
        ← Back to Top Artists
      </button>

      <h2 style={{
        fontSize: '1.8rem',
        marginBottom: '25px',
        borderBottom: '2px solid #1DB954',
        paddingBottom: '8px',
        textAlign: 'center'
      }}>
        Related Artists ({relatedArtists.length})
      </h2>

      <ul style={{
        listStyle: 'none',
        padding: 0,
        width: '100%',
        maxWidth: '700px',
        margin: '0 auto'
      }}>
        {relatedArtists.map((artist, index) => (
          <li key={artist.id || index} style={{
            background: '#222',
            borderRadius: '14px',
            margin: '12px 0',
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 3px 10px rgba(0,0,0,0.25)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer'
          }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.35)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.25)';
            }}
            onClick={() => {
              if (artist.external_urls?.spotify) {
                window.open(artist.external_urls.spotify, '_blank');
              }
            }}
          >
            {artist.images && artist.images[0] ? (
              <img
                src={artist.images[0].url}
                alt={artist.name}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '10px',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '10px',
                backgroundColor: '#333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#aaa'
              }}>
                No img
              </div>
            )}
            <div>
              <h4 style={{ margin: '0 0 5px', fontSize: '1.1rem' }}>{artist.name}</h4>
              <p style={{ margin: 0, color: '#aaa', fontSize: '0.9rem' }}>
                Popularity: {artist.popularity}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RelatedArtistsList;