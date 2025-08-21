import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchFlights } from "./utils"; // your API helper

const FlightDetails = () => {
  const { eventId } = useParams();
  const { state } = useLocation();
  const { origin, destination, departureDate } = state || {};

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!origin || !destination || !departureDate) {
      setError("Missing required flight parameters");
      return;
    }

    setLoading(true);
    fetchFlights(origin, destination, departureDate)
      .then((data) => setFlights(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [origin, destination, departureDate]);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (loading) return <p>Loading flights...</p>;

  return (
    <div>
      <h2>Flights for Event {eventId}</h2>
      {flights.map((flight, idx) => (
        <div key={idx}>
          Airline: {flight.airline} | Price: {flight.price}
        </div>
      ))}
    </div>
  );
};

export default FlightDetails;
