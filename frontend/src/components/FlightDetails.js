import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";

// Function to format time with timezone
const formatWithTimezone = (dateTimeStr, state) => {
  const stateTimezones = { /* your stateTimezones map */ };
  const timezone = stateTimezones[state] || "UTC";
  return DateTime.fromISO(dateTimeStr).setZone(timezone).toFormat("MMM dd, yyyy hh:mm a ZZZZ");
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

  const [maxStops, setMaxStops] = useState("");
  const [selectedAirport, setSelectedAirport] = useState("");
  const [sortBy, setSortBy] = useState("");

  // Auto-select first airport once destinationAirports is available
  useEffect(() => {
    if (destinationAirports.length > 0 && !selectedAirport) {
      setSelectedAirport(destinationAirports[0]);
    }
  }, [destinationAirports, selectedAirport]);

  // Fetch flights once origin, selectedAirport, and departureDate are set
  useEffect(() => {
    if (!origin || !selectedAirport || !departureDate) return;

    const fetchFlights = async () => {
      setLoading(true);
      setError(null);
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://vibent-api.onrender.com";
        const url = `${BACKEND_URL}/flights?origin=${origin}&destination=${selectedAirport}&departureDate=${departureDate}${returnDate ? `&returnDate=${returnDate}` : ""}`;
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

  // Format and filter flights
  const formatFlight = (flight) => {
    const itinerary = flight.itineraries?.[0];
    if (!itinerary || !itinerary.segments?.length) return null;

    const segments = itinerary.segments;
    const firstSeg = segments[0];
    const lastSeg = segments[segments.length - 1];
    const totalDurationMinutes = segments.reduce((sum, seg) => {
      const match = seg.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
      if (!match) return sum;
      return sum + (parseInt(match[1] || 0) * 60) + parseInt(match[2] || 0);
    }, 0);
    const airlineCodes = [...new Set(segments.map((seg) => seg.carrierCode))];

    return {
      airlines: airlineCodes.join(", "),
      price: parseFloat(flight.price?.total || 0),
      currency: flight.price?.currency || "USD",
      departure: { iata: firstSeg.departure.iataCode, time: formatWithTimezone(firstSeg.departure.at, eventState) },
      arrival: { iata: lastSeg.arrival.iataCode, time: formatWithTimezone(lastSeg.arrival.at, eventState) },
      durationMinutes: totalDurationMinutes,
      duration: `${Math.floor(totalDurationMinutes / 60)}h ${totalDurationMinutes % 60}m`,
      stops: segments.length - 1,
    };
  };

  let filteredFlights = flights
    .map(formatFlight)
    .filter((f) => f && (!maxStops || f.stops <= parseInt(maxStops)));

  if (sortBy) {
    filteredFlights.sort((a, b) => {
      switch (sortBy) {
        case "priceLowHigh": return a.price - b.price;
        case "priceHighLow": return b.price - a.price;
        case "duration": return a.durationMinutes - b.durationMinutes;
        case "stops": return a.stops - b.stops;
        default: return 0;
      }
    });
  }

  return (
    <div className="top-artists-container">
      <h2 className="title">Flights for Event {eventId}</h2>

      {/* Filters + Sort */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap", background: "#1e1e1e", padding: "12px", borderRadius: "12px" }}>
        <input type="number" placeholder="Max Stops" value={maxStops} onChange={(e) => setMaxStops(e.target.value)} style={{ padding: "8px", borderRadius: "8px" }} />
        {destinationAirports.length > 0 && (
          <select value={selectedAirport} onChange={(e) => setSelectedAirport(e.target.value)} style={{ padding: "8px", borderRadius: "8px" }}>
            {destinationAirports.map((code) => <option key={code} value={code}>{code}</option>)}
          </select>
        )}
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: "8px", borderRadius: "8px" }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px", width: "100%" }}>
        {filteredFlights.map((f, idx) => (
          <div key={idx} style={{ background: "#1e1e1e", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)", color: "#fff", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p><strong>Airlines:</strong> {f.airlines}</p>
              <p><strong>Departure:</strong> {f.departure.iata} - {f.departure.time}</p>
              <p><strong>Arrival:</strong> {f.arrival.iata} - {f.arrival.time}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#1DB954" }}>${f.price} {f.currency}</p>
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