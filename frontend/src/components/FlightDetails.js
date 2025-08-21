import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const FlightDetails = () => {
  const { eventId } = useParams();
  const { state } = useLocation();
  const { origin, destination, departureDate, flights: cachedFlights } = state || {};

  const [flights, setFlights] = useState(cachedFlights || []);
  const [loading, setLoading] = useState(!cachedFlights || cachedFlights.length === 0);
  const [error, setError] = useState(null);

  // Filters
  const [maxPrice, setMaxPrice] = useState("");
  const [maxStops, setMaxStops] = useState("");
  const [airportFilter, setAirportFilter] = useState("");

  // Sort
  const [sortBy, setSortBy] = useState("");

  // Helper to format flight info
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

    const durationStr = `${Math.floor(totalDurationMinutes / 60)}h ${totalDurationMinutes % 60}m`;

    const airlineCodes = [...new Set(segments.map(seg => seg.carrierCode))];
    const airlinesDisplay = airlineCodes.join(", ");

    return {
      airlines: airlinesDisplay,
      price: parseFloat(flight.price?.total || 0),
      currency: flight.price?.currency || "USD",
      departure: firstSeg.departure.iataCode,
      arrival: lastSeg.arrival.iataCode,
      duration: durationStr,
      durationMinutes: totalDurationMinutes,
      stops: segments.length - 1,
    };
  };

  useEffect(() => {
    if (cachedFlights && cachedFlights.length > 0) {
      setFlights(cachedFlights);
      setLoading(false);
      return;
    }

    if (!origin || !destination || !departureDate) {
      setError("Missing required flight parameters");
      setLoading(false);
      return;
    }

    setLoading(true);
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://vibent-api.onrender.com";
    fetch(`${BACKEND_URL}/flights?origin=${origin}&destination=${destination}&departureDate=${departureDate}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Flights API returned ${res.status}`);
        return res.json();
      })
      .then((data) => setFlights(data.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [origin, destination, departureDate, cachedFlights]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (loading) return <p>Loading flights...</p>;
  if (flights.length === 0) return <p>No flights found.</p>;

  // Apply filters
  let filteredFlights = flights.filter((flight) => {
    const f = formatFlight(flight);
    if (!f) return false;

    if (maxPrice && f.price > parseFloat(maxPrice)) return false;
    if (maxStops && f.stops > parseInt(maxStops)) return false;
    if (airportFilter && !(f.departure.includes(airportFilter) || f.arrival.includes(airportFilter))) {
      return false;
    }

    return true;
  });

  // Apply sorting
  if (sortBy) {
    filteredFlights = [...filteredFlights].sort((a, b) => {
      const fa = formatFlight(a);
      const fb = formatFlight(b);
      if (!fa || !fb) return 0;

      switch (sortBy) {
        case "priceLowHigh":
          return fa.price - fb.price;
        case "priceHighLow":
          return fb.price - fa.price;
        case "duration":
          return fa.durationMinutes - fb.durationMinutes;
        case "stops":
          return fa.stops - fb.stops;
        default:
          return 0;
      }
    });
  }

  return (
    <div className="top-artists-container">
      <h2 className="title">Flights for Event {eventId}</h2>

      {/* Filters + Sort */}
      <div
        style={{
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
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{ padding: "8px", borderRadius: "8px" }}
        />
        <input
          type="number"
          placeholder="Max Stops"
          value={maxStops}
          onChange={(e) => setMaxStops(e.target.value)}
          style={{ padding: "8px", borderRadius: "8px" }}
        />
        <input
          type="text"
          placeholder="Airport Code (ex: JFK)"
          value={airportFilter}
          onChange={(e) => setAirportFilter(e.target.value.toUpperCase())}
          style={{ padding: "8px", borderRadius: "8px" }}
        />

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

      {filteredFlights.length === 0 ? (
        <p>No flights match your filters.</p>
      ) : (
        filteredFlights.map((flight, idx) => {
          const f = formatFlight(flight);
          if (!f) return null;

          return (
            <div
              key={idx}
              style={{
                background: "#1e1e1e",
                borderRadius: "16px",
                padding: "16px",
                margin: "15px 0",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                color: "#fff",
              }}
            >
              <p><strong>Airlines:</strong> {f.airlines}</p>
              <p><strong>Price:</strong> ${f.price} {f.currency}</p>
              <p><strong>Departure:</strong> {f.departure}</p>
              <p><strong>Arrival:</strong> {f.arrival}</p>
              <p><strong>Duration:</strong> {f.duration}</p>
              <p><strong>Stops:</strong> {f.stops}</p>
            </div>
          );
        })
      )}
    </div>
  );
};

export default FlightDetails;
