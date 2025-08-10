import React, { useEffect, useState } from 'react';
import './TopArtistsList.css';
import stateToAirports from './StateToAirports';

console.log('Raw stateToAirports:', stateToAirports);

// Normalize keys by just lowercasing (keep spaces intact)
const normalizeKey = (str) => str.toLowerCase();

// Normalize the stateToAirports keys once at module level
const normalizedStateToAirports = Object.fromEntries(
  Object.entries(stateToAirports).map(([stateName, airports]) => [normalizeKey(stateName), airports])
);

console.log('Normalized keys:', Object.keys(normalizedStateToAirports));

const TopArtistsList = ({ topArtists, onShowRelatedArtists, onShowConcerts }) => {
  const [concertData, setConcertData] = useState({});
  const [expandedArtists, setExpandedArtists] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationFilter, setLocationFilter] = useState('');
  const [originAirport, setOriginAirport] = useState('SFO');

  const [flightOffers, setFlightOffers] = useState({});
  const [loadingFlights, setLoadingFlights] = useState({});
  const [errorFlights, setErrorFlights] = useState({});

  const toggleExpanded = (artistName) => {
    setExpandedArtists(prev => ({
      ...prev,
      [artistName]: !prev[artistName]
    }));
  };

  const toTitleCase = (str) => {
    if (!str) return '';
    return str
      .trim()
      .toLowerCase()
      .split(' ')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  const stateAbbrevToFull = {
    AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas",
    CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware",
    DC: "District of Columbia", FL: "Florida", GA: "Georgia", HI: "Hawaii",
    ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
    KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine",
    MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
    MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska",
    NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico",
    NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
    OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island",
    SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas",
    UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
    WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming"
  };


  useEffect(() => {
    const fetchConcerts = async () => {
      setLoading(true);
      setError(null);
      const data = {};

      for (const [index, artist] of topArtists.entries()) {
        try {
          if (index > 0) {
            await delay(300);
          }

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
          setError(error.message);
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
    const { state, date, country, id } = event;
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://vibent-api.onrender.com';
  
    console.log('Show flights clicked for event ID:', id);
    console.log('Show flights clicked for event:', event);
  
    if (!date) {
      alert('Missing concert date to fetch flights.');
      return;
    }
  
    if (!id) {
      console.warn('Event missing unique id:', event);
      alert('Cannot fetch flights: event ID missing.');
      return;
    }
  
    console.log('State before normalization:', state);
    console.log('Country before normalization:', country);
  
    let normalizedState = toTitleCase(state ? state.trim() : '');
    if (state && state.length === 2) {
      normalizedState = stateAbbrevToFull[state.toUpperCase()] || normalizedState;
    }
    const normalizedCountry = toTitleCase(country ? country.trim() : '');
  
    console.log('Normalized State:', normalizedState);
    console.log('Normalized Country:', normalizedCountry);
  
    console.log('Keys in normalizedStateToAirports:', Object.keys(normalizedStateToAirports));
  
    // Use lowercase keys without removing spaces for lookup
    const lookupKeyState = normalizeKey(normalizedState);
    const lookupKeyCountry = normalizeKey(normalizedCountry);
  
    console.log('Lookup Key State:', lookupKeyState);
    console.log('Lookup Key Country:', lookupKeyCountry);
  
    const destinationAirports =
      (normalizedState && normalizedStateToAirports[lookupKeyState]) ||
      (normalizedCountry && normalizedStateToAirports[lookupKeyCountry]);
  
    console.log('Destination Airports:', destinationAirports);
  
    if (!destinationAirports || destinationAirports.length === 0) {
      alert(`No airport codes found for ${state || country}.`);
      return;
    }
  
    const destination = destinationAirports[0];
  
    console.log('Fetching flights with:', {
      originAirport,
      destination,
      departureDate: date,
    });
  
    setLoadingFlights(prev => ({ ...prev, [id]: true }));
    setErrorFlights(prev => ({ ...prev, [id]: null }));
  
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
        [id]: json.data || []
      }));
    } catch (error) {
      console.error(`Error fetching flights for event ${id}:`, error);
      setErrorFlights(prev => ({ ...prev, [id]: error.message }));
      setFlightOffers(prev => ({ ...prev, [id]: [] }));
    } finally {
      setLoadingFlights(prev => ({ ...prev, [id]: false }));
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
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!loadingFlights[event.id]) {
                                    fetchFlightsForEvent(event);
                                  }
                                }}
                                disabled={loadingFlights[event.id]}
                                style={{
                                  backgroundColor: loadingFlights[event.id] ? '#555' : '#0070f3',
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
