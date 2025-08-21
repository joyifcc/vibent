import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchFlights } from "./utils"; // your API helper

const FlightDetails = () => {
  const { eventId } = useParams();
  const { state } = useLocation();
  const { origin, destination, departureDate, flights: cachedFlights } = state || {};

  const [flights, setFlights] = useState(cachedFlights || []);
  const [loading, setLoading] = useState(!cachedFlights || cachedFlights.length === 0);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If cached flights exist, no need to fetch
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
    fetchFlights(origin, destination, departureDate)
      .then((data) => setFlights(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [origin, destination, departureDate, cachedFlights]);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (loading) return <p>Loading flights...</p>;

  return (
    <div>
      <h2>Flights for Event {eventId}</h2>
      {flights.length === 0 ? (
        <p>No flights found.</p>
      ) : (
        flights.map((flight, idx) => (
          <div key={idx}>
            Airline: {flight.airline} | Price: {flight.price}
          </div>
        ))
      )}
    </div>
  );
};

export default FlightDetails;
