// src/components/RelatedArtistsList.js
import React from 'react';

const RelatedArtistsList = ({ relatedArtists, onBack, handleFindConcerts, concertResults, concertLoading }) => {
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
        <h2 style={{ textAlign: 'center' }}>No Related Artists Found</h2>
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

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {relatedArtists.map((artist, index) => (
          <li key={artist.id || index} style={{
            background: '#222',
            borderRadius: '14px',
            margin: '12px 0',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {artist.images?.[0]?.url ? (
                <img src={artist.images[0].url} alt={artist.name} style={{ width: 60, height: 60, borderRadius: 8 }} />
              ) : (
                <div style={{
                  width: 60, height: 60,
                  borderRadius: 8, backgroundColor: '#333',
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  color: '#aaa'
                }}>
                  No img
                </div>
              )}
              <div>
                <h4 style={{ margin: 0 }}>{artist.name}</h4>
                <p style={{ margin: 0, color: '#aaa' }}>Popularity: {artist.popularity}</p>
              </div>
            </div>

            <button
              onClick={() => handleFindConcerts(artist.name)}
              style={{
                background: '#1DB954',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer',
                alignSelf: 'flex-start'
              }}
            >
              {concertLoading === artist.name ? 'Searching...' : 'Find Concerts'}
            </button>

            {concertResults?.[artist.name]?.length > 0 && (
              <div style={{ marginTop: '10px', paddingLeft: '10px' }}>
                <h5 style={{ margin: '4px 0', color: '#1DB954' }}>Concerts:</h5>
                <ul style={{ paddingLeft: '20px' }}>
                  {concertResults[artist.name].map(event => (
                    <li key={event.id} style={{ marginBottom: '6px' }}>
                      <a href={event.url} target="_blank" rel="noopener noreferrer" style={{ color: '#ccc' }}>
                        {event.name} – {event.dates?.start?.localDate}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {concertResults?.[artist.name]?.length === 0 && (
              <p style={{ color: '#888' }}>No concerts found.</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RelatedArtistsList;
