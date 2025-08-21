import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const FlightDetails = () => {
  const { eventId } = useParams();
  const { state } = useLocation();
  const { origin, destination, departureDate, flights: cachedFlights } = state || {};

  const [flights, setFlights] = useState(cachedFlights || []);
  const [loading, setLoading] = useState(!cachedFlights || cachedFlights.length === 0);
  const [error, setError] = useState(null);

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
      price: flight.price?.total,
      departure: firstSeg.departure.iataCode,
      arrival: lastSeg.arrival.iataCode,
      duration: durationStr,
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

  return (
    <div>
      <h2>Flights for Event {eventId}</h2>
      {flights.map((flight, idx) => {
        const f = formatFlight(flight);
        if (!f) return null;
        return (
          <div key={idx}>
            Airlines: {f.airlines} | Price: ${f.price} | Depart: {f.departure} | Arrive: {f.arrival} | Duration: {f.duration} | Stops: {f.stops}
          </div>
        );
      })}
    </div>
  );
};

export default FlightDetails;
