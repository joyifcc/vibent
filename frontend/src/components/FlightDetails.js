import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const FlightDetails = () => {
  const location = useLocation();
  const { origin, destination, departureDate } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [flights, setFlights] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/flights?origin=${origin}&destination=${destination}&departureDate=${departureDate}`
        );
        if (!response.ok) throw new Error("Failed to fetch flights");
        const data = await response.json();
        setFlights(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [origin, destination, departureDate]);

  if (loading) return <p className="text-center mt-8 text-lg">Loading flights...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Flights from {origin} to {destination}
      </h1>
      {flights.length === 0 ? (
        <p className="text-center text-gray-600">No flights found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flights.map((flight, index) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-xl p-5 border border-gray-200 hover:shadow-xl transition"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {flight.itineraries[0].segments[0].carrierCode} -{" "}
                {flight.itineraries[0].segments[0].number}
              </h2>
              <p className="text-gray-700">
                <span className="font-medium">From:</span>{" "}
                {flight.itineraries[0].segments[0].departure.iataCode}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">To:</span>{" "}
                {flight.itineraries[0].segments.slice(-1)[0].arrival.iataCode}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Departure:</span>{" "}
                {flight.itineraries[0].segments[0].departure.at}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Arrival:</span>{" "}
                {flight.itineraries[0].segments.slice(-1)[0].arrival.at}
              </p>
              <p className="text-gray-900 font-semibold mt-3">
                Price: {flight.price.total} {flight.price.currency}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlightDetails;
