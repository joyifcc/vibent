import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { airportToState, formatWithTimezone, airlineNames } from './utils'; // import helpers

const FlightDetails = ({ originAirport, normalizedStateToAirports }) => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      setError(null);

      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://vibent-api.onrender.com';
        // You might need to pass more info in query to backend if event ID alone is insufficient
        const res = await fetch(`${BACKEND_URL}/flights?eventId=${eventId}&origin=${originAirport}`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Flights API returned ${res.status}: ${text}`);
        }

        const json = await res.json();
        setFlights(json.data || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchFlights();
    }
  }, [eventId, originAirport]);

  if (loading) return <p>Loading flights...</p>;
  if (error) return <p style={{ color: 'red' }}>Error loading flights: {error}</p>;

  if (flights.length === 0) return <p>No flights found for this event.</p>;

  return (
    <div style={{ padding: '20px' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: '20px',
          backgroundColor: '#555',
          color: 'white',
          border: 'none',
          padding: '6px 12px',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        ← Back
      </button>

      <h2>All Flights for Event {eventId}</h2>
      <ul style={{ paddingLeft: '20px' }}>
        {flights.map((flight, idx) => {
          const itinerary = flight.itineraries?.[0];
          if (!itinerary) return null;

          const segments = itinerary.segments || [];
          if (segments.length === 0) return null;

          const firstSegment = segments[0];
          const lastSegment = segments[segments.length - 1];

          const totalDurationMinutes = segments.reduce((sum, seg) => {
            const match = seg.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
            if (!match) return sum;
            const hours = parseInt(match[1] || 0);
            const minutes = parseInt(match[2] || 0);
            return sum + hours * 60 + minutes;
          }, 0);

          const durationHours = Math.floor(totalDurationMinutes / 60);
          const durationMinutes = totalDurationMinutes % 60;
          const durationStr = `${durationHours}h ${durationMinutes}m`;

          const departureState = airportToState[firstSegment.departure.iataCode] || 'UTC';
          const arrivalState = airportToState[lastSegment.arrival.iataCode] || 'UTC';
          const departureLocal = formatWithTimezone(firstSegment.departure.at, departureState);
          const arrivalLocal = formatWithTimezone(lastSegment.arrival.at, arrivalState);

          const airlineCodes = [...new Set(segments.map(seg => seg.carrierCode))];
          const airlineNamesList = airlineCodes.map(code => airlineNames[code] || code);
          const airlinesDisplay = airlineNamesList
            .map((name, i) => `${name} (${airlineCodes[i]})`)
            .join(', ');

          return (
            <li key={idx} style={{ fontSize: '0.9rem', marginBottom: '10px' }}>
              <strong>Airline(s):</strong> {airlinesDisplay} |&nbsp;
              <strong>Price:</strong> ${flight.price?.total} |&nbsp;
              <strong>Depart:</strong> {departureLocal} ({firstSegment.departure.iataCode}) |&nbsp;
              <strong>Arrive:</strong> {arrivalLocal} ({lastSegment.arrival.iataCode}) |&nbsp;
              <strong>Duration:</strong> {durationStr} |&nbsp;
              <strong>Stops:</strong> {segments.length - 1}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default FlightDetails;
