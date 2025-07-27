// src/components/ConcertFinder.js
import React, { useState, useEffect } from 'react';

function ConcertFinder({ artists, onBack, token, backendUrl }) {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConcerts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get artist names for the first 10 artists
        const artistNames = artists.slice(0, 10).map(artist => artist.name);
        
        // Fetch concerts from backend
        const response = await fetch(`${backendUrl}/concerts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ artists: artistNames })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch concerts: ${response.status}`);
        }
        
        const data = await response.json();
        setConcerts(data.events || []);
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
  }, [artists, token, backendUrl]);

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

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

      {!loading && concerts.length === 0 && !error && (
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

      {concerts.length > 0 && (
        <div>
          {concerts.map((concert, index) => (
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
          margin: 0 auto 20px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #1DB954;
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