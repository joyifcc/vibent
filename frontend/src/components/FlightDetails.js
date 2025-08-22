import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";

// Function to format time with timezone
const formatWithTimezone = (dateTimeStr, state) => {
  const stateTimezones = {
    "Alabama": "America/Chicago",
    "Alaska": "America/Anchorage",
    "Arizona": "America/Phoenix",
    "Arkansas": "America/Chicago",
    "California": "America/Los_Angeles",
    "Colorado": "America/Denver",
    "Connecticut": "America/New_York",
    "Delaware": "America/New_York",
    "District of Columbia": "America/New_York",
    "Florida": "America/New_York",
    "Georgia": "America/New_York",
    "Hawaii": "Pacific/Honolulu",
    "Idaho": "America/Boise",
    "Illinois": "America/Chicago",
    "Indiana": "America/Indiana/Indianapolis",
    "Iowa": "America/Chicago",
    "Kansas": "America/Chicago",
    "Kentucky": "America/New_York",
    "Louisiana": "America/Chicago",
    "Maine": "America/New_York",
    "Maryland": "America/New_York",
    "Massachusetts": "America/New_York",
    "Michigan": "America/Detroit",
    "Minnesota": "America/Chicago",
    "Mississippi": "America/Chicago",
    "Missouri": "America/Chicago",
    "Montana": "America/Denver",
    "Nebraska": "America/Chicago",
    "Nevada": "America/Los_Angeles",
    "New Hampshire": "America/New_York",
    "New Jersey": "America/New_York",
    "New Mexico": "America/Denver",
    "New York": "America/New_York",
    "North Carolina": "America/New_York",
    "North Dakota": "America/Chicago",
    "Ohio": "America/New_York",
    "Oklahoma": "America/Chicago",
    "Oregon": "America/Los_Angeles",
    "Pennsylvania": "America/New_York",
    "Rhode Island": "America/New_York",
    "South Carolina": "America/New_York",
    "South Dakota": "America/Chicago",
    "Tennessee": "America/Chicago",
    "Texas": "America/Chicago",
    "Utah": "America/Denver",
    "Vermont": "America/New_York",
    "Virginia": "America/New_York",
    "Washington": "America/Los_Angeles",
    "West Virginia": "America/New_York",
    "Wisconsin": "America/Chicago",
    "Wyoming": "America/Denver"
  };

  const timezone = stateTimezones[state] || "UTC";
  return DateTime.fromISO(dateTimeStr)
    .setZone(timezone)
    .toFormat("MMM dd, yyyy hh:mm a ZZZZ");
};

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

const FlightDetails = () => {
  const { eventId } = useParams();
  const { state: navState } = useLocation();
  const {
    origin,
    destinationAirports = [],
    departureDate,
    flights: cachedFlights,
    eventState,
    returnDate,
  } = navState || {};

  const [flights, setFlights] = useState(cachedFlights || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [maxStops, setMaxStops] = useState("");
  const [selectedAirport, setSelectedAirport] = useState("");

  // Sort
  const [sortBy, setSortBy] = useState("");

  // Format flight for display
  const formatFlight = (flight) => {
    const itinerary = flight.itineraries?.[0];
    if (!itinerary || !itinerary.segments?.length) return null;

    const segments = itinerary.segments;
    const firstSeg = segments[0];
    const lastSeg = segments[segments.length - 1];

    const totalDurationMinutes = segments.reduce((sum, seg) => {
      const match = seg.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
      if (!match) return sum;
      const hours = parseInt(match[1] || 0);
      const minutes = parseInt(match[2] || 0);
      return sum + hours * 60 + minutes;
    }, 0);

    const airlineCodes = [...new Set(segments.map((seg) => seg.carrierCode))];

    return {
      airlines: airlineCodes.join(", "),
      price: parseFloat(flight.price?.total || 0),
      currency: flight.price?.currency || "USD",
      departure: {
        iata: firstSeg.departure.iataCode,
        time: formatWithTimezone(firstSeg.departure.at, eventState)
      },
      arrival: {
        iata: lastSeg.arrival.iataCode,
        time: formatWithTimezone(lastSeg.arrival.at, eventState)
      },
      durationMinutes: totalDurationMinutes,
      duration: `${Math.floor(totalDurationMinutes / 60)}h ${totalDurationMinutes % 60}m`,
      stops: segments.length - 1,
    };
  };

  useEffect(() => {
    if (destinationAirports.length > 0 && !selectedAirport) {
      setSelectedAirport(destinationAirports[0]);
    }
  }, [destinationAirports, selectedAirport]);

  // --- FIXED FETCH ---
  useEffect(() => {
    if (!origin || !selectedAirport || !departureDate || !returnDate) return;

    const fetchFlights = async () => {
      setLoading(true);
      setError(null);

      try {
        const BACKEND_URL =
          process.env.REACT_APP_BACKEND_URL || "https://vibent-api.onrender.com";

        // Keep date as YYYY-MM-DD (no timezone conversion)
        const url = `${BACKEND_URL}/flights?origin=${origin}&destination=${selectedAirport}&departureDate=${departureDate}&returnDate=${returnDate}`;


        console.log("Fetching flights from:", url);

        const res = await fetch(url);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Flights API returned ${res.status}: ${text}`);
        }

        const json = await res.json();
        setFlights(json.data || []);
      } catch (err) {
        setError(err.message);
        setFlights([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [origin, selectedAirport, departureDate, returnDate]);

  // Filter flights
  let filteredFlights = flights
    .map(formatFlight)
    .filter((f) => f && (!maxStops || f.stops <= parseInt(maxStops)));

  // Sort flights
  if (sortBy) {
    filteredFlights.sort((a, b) => {
      switch (sortBy) {
        case "priceLowHigh":
          return a.price - b.price;
        case "priceHighLow":
          return b.price - a.price;
        case "duration":
          return a.durationMinutes - b.durationMinutes;
        case "stops":
          return a.stops - b.stops;
        default:
          return 0;
      }
    });
  }

  return (
    <div className="top-artists-container">
      <h2 className="title">Flights for Event {eventId}</h2>

      {/* Filters + Sort */}
      <div style={{
          display: "flex",
          gap: "16px",
          marginBottom: "20px",
          flexWrap: "wrap",
          background: "#1e1e1e",
          padding: "12px",
          borderRadius: "12px",
        }}
      >
        <input
          type="number"
          placeholder="Max Stops"
          value={maxStops}
          onChange={(e) => setMaxStops(e.target.value)}
          style={{ padding: "8px", borderRadius: "8px" }}
        />

        {destinationAirports.length > 0 && (
          <select
            value={selectedAirport}
            onChange={(e) => setSelectedAirport(e.target.value)}
            style={{ padding: "8px", borderRadius: "8px" }}
          >
            <option value="">Select Airport</option>
            {destinationAirports.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        )}

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: "8px", borderRadius: "8px" }}
        >
          <option value="">Sort By</option>
          <option value="priceLowHigh">Price: Low to High</option>
          <option value="priceHighLow">Price: High to Low</option>
          <option value="duration">Duration: Shortest</option>
          <option value="stops">Stops: Fewest</option>
        </select>
      </div>

      {loading && <p>Loading flights...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && filteredFlights.length === 0 && <p>No flights found.</p>}

      <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "24px",
          width: "100%",
        }}
      >
        {filteredFlights.map((f, idx) => (
          <div key={idx} style={{
              background: "#1e1e1e",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              color: "#fff",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <p><strong>Airlines:</strong> {f.airlines}</p>
              <p><strong>Departure:</strong> {f.departure.iata} - {f.departure.time}</p>
              <p><strong>Arrival:</strong> {f.arrival.iata} - {f.arrival.time}</p>
            </div>

            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#1DB954" }}>
                ${f.price} {f.currency}
              </p>
              <p style={{ color: "#aaa", fontSize: "0.9rem" }}>Duration: {f.duration}</p>
              <p style={{ color: "#aaa", fontSize: "0.9rem" }}>Stops: {f.stops}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlightDetails;