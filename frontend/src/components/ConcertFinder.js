// src/components/ConcertFinder.js
import React, { useState, useEffect } from 'react';

function ConcertFinder({ artists, onBack, token, backendUrl }) {
  const [concertData, setConcertData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConcerts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get artist names for the first 10 artists
        const artistNames = artists.slice(0, 10).map(artist => artist.name);
        const concertResults = {};
        
        // Fetch concerts for each artist individually using the existing endpoint
        for (const artistName of artistNames) {
          try {
            const response = await fetch(`/api/concerts?artistName=${encodeURIComponent(artistName)}`);
            
            if (!response.ok) {
              console.warn(`Failed to fetch concerts for ${artistName}: ${response.status}`);
              continue; // Skip to next artist if this one fails
            }
            
            const data = await response.json();
            concertResults[artistName] = data.events || [];
          } catch (artistError) {
            console.error(`Error fetching concerts for ${artistName}:`, artistError);
          }
        }
        
        setConcertData(concertResults);
      } catch (err) {
        console.error("Error fetching concerts:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (artists && artists.length > 0) {
      fetchConcerts();
    }
  }, [artists]);

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Flatten all concerts from different artists into a single array
  const allConcerts = Object.values(concertData)
    .flat()
    .filter(concert => concert) // Remove any undefined values
    // Remove duplicates based on event ID
    .filter((concert, index, self) => 
      index === self.findIndex(c => c.id === concert.id)
    );

  return (
    <div style={{
      width: '100%',
      maxWidth: '800px',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1 style={{ margin: 0 }}>Upcoming Concerts</h1>
        <button 
          onClick={onBack}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '5px',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Back to Artists
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div className="loading-spinner"></div>
          <p>Finding concerts for your favorite artists...</p>
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(255, 0, 0, 0.2)',
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <p style={{ margin: 0 }}>Error: {error}</p>
        </div>
      )}

      {!loading && allConcerts.length === 0 && !error && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '20px',
          borderRadius: '5px',
          textAlign: 'center'
        }}>
          <p>No upcoming concerts found for your artists.</p>
          <p>Try expanding your artist selection or check back later!</p>
        </div>
      )}

      {allConcerts.length > 0 && (
        <div>
          {allConcerts.map((concert, index) => (
            <div 
              key={concert.id || index}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '15px',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onClick={() => {
                if (concert.url) {
                  window.open(concert.url, '_blank');
                }
              }}
            >
              <h3 style={{ margin: '0 0 10px 0' }}>{concert.name}</h3>
              
              {concert.dates && concert.dates.start && (
                <p style={{ margin: '5px 0' }}>
                  <strong>Date:</strong> {formatDate(concert.dates.start.dateTime || concert.dates.start.localDate)}
                </p>
              )}
              
              {concert._embedded && concert._embedded.venues && concert._embedded.venues[0] && (
                <>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Venue:</strong> {concert._embedded.venues[0].name}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Location:</strong> {concert._embedded.venues[0].city?.name}, {concert._embedded.venues[0].state?.stateCode || concert._embedded.venues[0].country?.countryCode}
                  </p>
                </>
              )}
              
              {concert.priceRanges && concert.priceRanges[0] && (
                <p style={{ margin: '5px 0' }}>
                  <strong>Price:</strong> ${concert.priceRanges[0].min} - ${concert.priceRanges[0].max}
                </p>
              )}
              
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '10px'
              }}>
                <span style={{
                  background: '#1DB954',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}>
                  Get Tickets
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .loading-spinner {
          width: 40px;
          height: 40px;
          margin: 0 auto;
          border: 4px solid rgba(255, 255, 255, 0.2);
          border-top: 4px solid #ffffff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default ConcertFinder;