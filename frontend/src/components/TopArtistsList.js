import React, { useEffect, useState } from 'react';
import './TopArtistsList.css';
import { DateTime } from "luxon";
import { useNavigate } from 'react-router-dom';



const stateToAirports = {
  "Alabama": ["BHM", "HSV", "MGM", "MOB"], // Birmingham, Huntsville, Montgomery, Mobile
  "Alaska": ["ANC", "FAI", "JNU", "SEA"], // Anchorage, Fairbanks, Juneau, plus Seattle (common hub)
  "Arizona": ["PHX", "TUS", "SDL"], // Phoenix, Tucson, Scottsdale (private/charter)
  "Arkansas": ["XNA", "LIT", "FSM"], // Northwest Arkansas, Little Rock, Fort Smith
  "California": ["LAX", "SFO", "SAN", "SJC", "OAK", "SMF", "BUR", "ONT", "SNA", "LGB"], // Major CA airports
  "Colorado": ["DEN", "COS", "GJT"], // Denver, Colorado Springs, Grand Junction
  "Connecticut": ["BDL", "HVN"], // Bradley (Hartford), Tweed New Haven
  "Delaware": ["ILG"], // Wilmington (small, near Philadelphia)
  "District of Columbia": ["DCA", "IAD", "BWI"], // Reagan, Dulles, Baltimore-Washington
  "Florida": ["MIA", "FLL", "TPA", "MCO", "RSW", "JAX", "PBI"], // Miami, Fort Lauderdale, Tampa, Orlando, Southwest Florida, Jacksonville, Palm Beach
  "Georgia": ["ATL", "SAV", "AGS", "MCN"], // Atlanta, Savannah, Augusta, Macon
  "Hawaii": ["HNL", "OGG", "KOA", "LIH"], // Honolulu, Maui, Kona, Lihue
  "Idaho": ["BOI", "IDA"], // Boise, Idaho Falls
  "Illinois": ["ORD", "MDW", "SPI", "RFD"], // O’Hare, Midway, Springfield, Rockford
  "Indiana": ["IND", "SBN"], // Indianapolis, South Bend
  "Iowa": ["DSM", "CID", "MLI"], // Des Moines, Cedar Rapids, Moline
  "Kansas": ["ICT", "MCI", "FOE"], // Wichita, Kansas City, Topeka
  "Kentucky": ["CVG", "SDF", "LEX"], // Cincinnati/Northern KY, Louisville, Lexington
  "Louisiana": ["MSY", "BTR", "LFT"], // New Orleans, Baton Rouge, Lafayette
  "Maine": ["PWM", "BGR"], // Portland, Bangor
  "Maryland": ["BWI", "MTN"], // Baltimore-Washington, Martin State
  "Massachusetts": ["BOS", "ORH", "EWB"], // Boston Logan, Worcester, New Bedford
  "Michigan": ["DTW", "GRR", "MBS", "AZO"], // Detroit, Grand Rapids, Saginaw, Kalamazoo
  "Minnesota": ["MSP", "DLH", "RST"], // Minneapolis-St Paul, Duluth, Rochester
  "Mississippi": ["JAN", "GPT"], // Jackson, Gulfport
  "Missouri": ["STL", "MCI", "SGF"], // St. Louis, Kansas City, Springfield
  "Montana": ["BIL", "GTF", "MSO"], // Billings, Great Falls, Missoula
  "Nebraska": ["OMA", "LNK"], // Omaha, Lincoln
  "Nevada": ["LAS", "RNO"], // Las Vegas, Reno
  "New Hampshire": ["MHT", "CON"], // Manchester, Concord (small)
  "New Jersey": ["EWR", "ACY", "TTN"], // Newark, Atlantic City, Trenton-Mercer
  "New Mexico": ["ABQ", "SRR"], // Albuquerque, Santa Rosa (small)
  "New York": ["JFK", "LGA", "EWR", "BUF", "ROC", "SYR", "ALB"], // JFK, LaGuardia, Newark, Buffalo, Rochester, Syracuse, Albany
  "North Carolina": ["CLT", "RDU", "GSO", "ILM"], // Charlotte, Raleigh-Durham, Greensboro, Wilmington
  "North Dakota": ["FAR", "GFK"], // Fargo, Grand Forks
  "Ohio": ["CLE", "CMH", "CVG", "DAY"], // Cleveland, Columbus, Cincinnati, Dayton
  "Oklahoma": ["OKC", "TUL"], // Oklahoma City, Tulsa
  "Oregon": ["PDX", "EUG"], // Portland, Eugene
  "Pennsylvania": ["PHL", "PIT", "AVP", "MDT"], // Philadelphia, Pittsburgh, Wilkes-Barre/Scranton, Harrisburg
  "Rhode Island": ["PVD"], // Providence
  "South Carolina": ["CHS", "GSP", "CAE"], // Charleston, Greenville-Spartanburg, Columbia
  "South Dakota": ["FSD", "RAP"], // Sioux Falls, Rapid City
  "Tennessee": ["BNA", "MEM", "CHA"], // Nashville, Memphis, Chattanooga
  "Texas": ["DFW", "IAH", "AUS", "SAT", "DAL", "HOU"], // Dallas-Fort Worth, Houston, Austin, San Antonio, Dallas Love, Houston Hobby
  "Utah": ["SLC", "PVU"], // Salt Lake City, Provo (small)
  "Vermont": ["BTV"], // Burlington
  "Virginia": ["DCA", "ORF", "RIC"], // Reagan, Norfolk, Richmond
  "Washington": ["SEA", "GEG", "PDX"], // Seattle, Spokane, Portland (nearby)
  "West Virginia": ["CRW", "HTS"], // Charleston, Huntington
  "Wisconsin": ["MKE", "MSN", "GRB"], // Milwaukee, Madison, Green Bay
  "Wyoming": ["JAC"], // Jackson Hole
};

const airlineNames = {
  "6X": "Amadeus Six",
  "PR": "Philippine Airlines",
  "AA": "American Airlines",
  "DL": "Delta Air Lines",
  "UA": "United Airlines",
  "WN": "Southwest Airlines",
  "AS": "Alaska Airlines",
  "B6": "JetBlue Airways",
  "AF": "Air France",
  "LH": "Lufthansa",
  "EK": "Emirates",
  "AC": "Air Canada",
  "BA": "British Airways",
  "CX": "Cathay Pacific",
  "QF": "Qantas",
  "SQ": "Singapore Airlines",
  "JL": "Japan Airlines",
  "NH": "All Nippon Airways",
  "IB": "Iberia",
  "AZ": "Alitalia",
  "KL": "KLM Royal Dutch Airlines",
  "TK": "Turkish Airlines",
  "SA": "South African Airways",
  "NZ": "Air New Zealand",
  "EY": "Etihad Airways",
  "QR": "Qatar Airways",
  "MS": "EgyptAir",
  "CX": "Cathay Pacific",
  "FI": "Icelandair",
  "DL": "Delta Air Lines",
  "F9": "Frontier Airlines",
  "G4": "Allegiant Air",
  "HA": "Hawaiian Airlines",
  "VX": "Virgin America",
  "WN": "Southwest Airlines",
  "YV": "Mesa Airlines",
};


console.log('Raw stateToAirports:', stateToAirports);
console.log('Is empty?', Object.keys(stateToAirports).length === 0);

const normalizeKey = str => str.toLowerCase().replace(/\s+/g, '');

const normalizedStateToAirports = Object.fromEntries(
  Object.entries(stateToAirports).map(([state, airports]) => [normalizeKey(state), airports])
);

console.log('Normalized keys:', Object.keys(normalizedStateToAirports));



const TopArtistsList = ({ topArtists, onShowRelatedArtists, onShowConcerts }) => {
  const navigate = useNavigate();
  const [concertData, setConcertData] = useState({});
  const [expandedArtists, setExpandedArtists] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationFilter, setLocationFilter] = useState('');
  const [originAirport, setOriginAirport] = useState('SFO');

  // NEW: flexible arrival/departure days
  const [daysBefore, setDaysBefore] = useState(1);
  const [daysAfter, setDaysAfter] = useState(1);


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


    // Add this **above** the return() but inside your TopArtistsList component
    const handleShowFlights = (event) => {
      const missingParams = [];
    
      // Check origin
      if (!originAirport) missingParams.push("originAirport");
    
      // Normalize state
      const normalizedState =
        event.state?.length === 2
          ? stateAbbrevToFull[event.state.toUpperCase()] || event.state
          : toTitleCase(event.state || '');
    
      // Lookup destination airports
      const destinationAirports = normalizedState
        ? stateToAirports[normalizedState] || []
        : [];
      if (!destinationAirports.length) missingParams.push("destinationAirports");
    
      // Check departure date
      if (!event.date) missingParams.push("departureDate");
    
      // Check flexible dates
      if (daysBefore === null || daysBefore === undefined) missingParams.push("daysBefore");
      if (daysAfter === null || daysAfter === undefined) missingParams.push("daysAfter");
    
      // Optional: check event location info
      if (!event.state) missingParams.push("eventState");
      if (!event.country) missingParams.push("eventCountry");
    
      if (missingParams.length > 0) {
        console.warn("Missing flight parameters:", missingParams);
        alert("Missing required flight parameters: " + missingParams.join(", "));
        return;
      }
    
      // Debug: log all flight parameters
      console.log("Navigating to FlightDetails with parameters:", {
        origin: originAirport,
        destinationAirports,
        departureDate: event.date,
        daysBefore,
        daysAfter,
        eventState: event.state,
        eventCountry: event.country,
      });
    
      // All parameters present, navigate to FlightDetails
      navigate(`/flights/${event.id}`, {
        state: {
          origin: originAirport,
          destinationAirports,
          departureDate: event.date,
          daysBefore,
          daysAfter,
          eventState: event.state,
          eventCountry: event.country,
        },
      });
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

      {/* Flexible Date Inputs */}
      <div style={{ margin: '10px 0', textAlign: 'center' }}>
        <label>
          Arrive up to{' '}
          <input
            type="number"
            min="0"
            value={daysBefore}
            onChange={(e) => setDaysBefore(Number(e.target.value))}
            style={{ width: '40px', margin: '0 5px' }}
          />{' '}
          day(s) before
        </label>
        <label style={{ marginLeft: '15px' }}>
          Leave up to{' '}
          <input
            type="number"
            min="0"
            value={daysAfter}
            onChange={(e) => setDaysAfter(Number(e.target.value))}
            style={{ width: '40px', margin: '0 5px' }}
          />{' '}
          day(s) after
        </label>
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

          const airportToState = {};
          Object.entries(stateToAirports).forEach(([state, airports]) => {
            airports.forEach(code => { airportToState[code] = state; });
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
                                    onClick={() => handleShowFlights(event)}
                                    style={{
                                      backgroundColor: '#0070f3',
                                      color: 'white',
                                      border: 'none',
                                      padding: '5px 10px',
                                      borderRadius: '5px',
                                      cursor: 'pointer',
                                      fontSize: '0.9rem',
                                    }}
                                  >
                                    Show Flights
                                  </button>

                                </div>
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






