import React, { useState } from 'react';

export default function Flights() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [flights, setFlights] = useState([]);

  const searchFlights = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/flights?origin=${origin}&destination=${destination}&date=${date}`
      );
      const data = await res.json();
      setFlights(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Find Flights</h2>
      <input
        type="text"
        placeholder="Origin (e.g. SFO)"
        value={origin}
        onChange={(e) => setOrigin(e.target.value)}
      />
      <input
        type="text"
        placeholder="Destination (e.g. LAX)"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <button onClick={searchFlights}>Search</button>

      <ul>
        {flights.map((flight, i) => (
          <li key={i}>
            {flight.itineraries[0].segments[0].departure.iataCode} →{' '}
            {flight.itineraries[0].segments[0].arrival.iataCode} | 
            {flight.price.total} {flight.price.currency}
          </li>
        ))}
      </ul>
    </div>
  );
}
