import React, { useEffect, useState } from 'react';
import './TopArtistsList.css';
import stateToAirports from './StateToAirports';

const TopArtistsList = ({ topArtists, onShowRelatedArtists, onShowConcerts }) => {
  const [concertData, setConcertData] = useState({});
  const [expandedArtists, setExpandedArtists] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationFilter, setLocationFilter] = useState('');
  const [originAirport, setOriginAirport] = useState('SFO');

  // Flight offers states per event
  const [flightOffers, setFlightOffers] = useState({});
  const [loadingFlights, setLoadingFlights] = useState({});
  const [errorFlights, setErrorFlights] = useState({});

  const toggleExpanded = (artistName) => {
    setExpandedArtists(prev => ({
      ...prev,
      [artistName]: !prev[artistName]
    }));
  };

  // Helper to normalize strings to Title Case (handles multi-word states)
  const toTitleCase = (str) => {
    if (!str) return null;
    return str
      .trim()
      .toLowerCase()
      .split(' ')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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

  const fetchFlightsForEvent = async (event) => {
    const { state, date, country } = event;
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://vibent-api.onrender.com';

    if (!date) {
      alert('Missing concert date to fetch flights.');
      return;
    }

    // Normalize state and country strings
    const normalizedState = toTitleCase(state);
    const normalizedCountry = toTitleCase(country);

    // Lookup airports by normalized state or fallback to normalized country
    const destinationAirports =
      (normalizedState && stateToAirports[normalizedState]) ||
      (normalizedCountry && stateToAirports[normalizedCountry]);

    if (!destinationAirports || destinationAirports.length === 0) {
      alert(`No airport codes found for ${state || country}.`);
      return;
    }

    // Pick first airport for now
    const destination = destinationAirports[0];

    setLoadingFlights(prev => ({ ...prev, [event.id]: true }));
    setErrorFlights(prev => ({ ...prev, [event.id]: null }));

    try {
      const url = `${BACKEND_URL}/flights?origin=${originAirport}&destination=${destination}&departureDate=${date}`;
      const res = await fetch(url);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Flights API returned ${res.status}: ${text}`);
      }

      const json = await res.json();

      setFlightOffers(prev => ({
        ...prev,
        [event.id]: json.data || []
      }));
    } catch (error) {
      console.error(`Error fetching flights for event ${event.id}:`, error);
      setErrorFlights(prev => ({ ...prev, [event.id]: error.message }));
      setFlightOffers(prev => ({ ...prev, [event.id]: [] }));
    } finally {
      setLoadingFlights(prev => ({ ...prev, [event.id]: false }));
    }
  };

  // Flatten and deduplicate airport codes for origin airport dropdown
  const allAirports = [...new Set(Object.values(stateToAirports).flat())];

  return (
    <div className="top-artists-container">
      <h1 className="title">Your Top Spotify Artists</h1>

      {/* Origin Airport Selector */}
      <div style={{ margin: '20px 0', textAlign: 'center' }}>
        <label htmlFor="originAirport" style={{ marginRight: '10px' }}>
          Select your home airport:
        </label>
        <select
          id="originAirport"
          value={originAirport}
          onChange={(e) => setOriginAirport(e.target.value)}
          style={{ padding: '8px', fontSize: '1rem', borderRadius: '6px' }}
        >
          {allAirports.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </div>

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
              (event.name && event.name.toLowerCase().includes(query))
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

                    {expandedArtists[artist.name] && (
                      <ul className="concert-list" style={{ marginTop: '10px' }}>
                        {filteredConcerts.map((event, i) => (
                          <li key={i} className="concert-item" style={{ marginBottom: '20px' }}>
                            <a
                              href={event.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#1DB954', textDecoration: 'underline' }}
                            >
                              {event.name}
                            </a> — {event.date} @ {event.venue}

                            {/* Show Flights */}
                            <div style={{ marginTop: '8px' }}>
                              <button
                                onClick={() => fetchFlightsForEvent(event)}
                                disabled={loadingFlights[event.id]}
                                style={{
                                  backgroundColor: '#0070f3',
                                  color: 'white',
                                  border: 'none',
                                  padding: '5px 10px',
                                  borderRadius: '5px',
                                  cursor: loadingFlights[event.id] ? 'not-allowed' : 'pointer',
                                  fontSize: '0.9rem'
                                }}
                              >
                                {loadingFlights[event.id] ? 'Loading Flights...' : 'Show Flights'}
                              </button>
                            </div>

                            {errorFlights[event.id] && (
                              <p style={{ color: 'red' }}>Error loading flights: {errorFlights[event.id]}</p>
                            )}

                            {flightOffers[event.id]?.length > 0 && (
                              <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                                {flightOffers[event.id].map((flight, idx) => (
                                  <li key={idx} style={{ fontSize: '0.9rem' }}>
                                    Airline: {flight.itineraries?.[0]?.segments?.[0]?.carrierCode} | 
                                    Price: ${flight.price?.total} | 
                                    Depart: {new Date(flight.itineraries?.[0]?.segments?.[0]?.departure?.at).toLocaleString()} | 
                                    Arrive: {new Date(flight.itineraries?.[0]?.segments?.[0]?.arrival?.at).toLocaleString()}
                                  </li>
                                ))}
                              </ul>
                            )}
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
    </div>
  );
};

export default TopArtistsList;
