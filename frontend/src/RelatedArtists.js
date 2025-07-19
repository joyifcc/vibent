import React, { useEffect, useState } from 'react';

// Define BACKEND_URL outside the component to avoid recreating it on every render
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://your-actual-backend-url.onrender.com';

function RelatedArtists({ artistId, accessToken }) {
  const [relatedArtists, setRelatedArtists] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!artistId || !accessToken) return;

    setLoading(true);
    console.log(`Fetching related artists for ${artistId}...`);
    
    fetch(`${BACKEND_URL}/related-artists/${artistId}?access_token=${accessToken}`)
      .then(res => {
        if (!res.ok) {
          console.error(`Error response: ${res.status}`);
          throw new Error(`Failed to fetch related artists (${res.status})`);
        }
        return res.json();
      })
      .then(data => {
        console.log(`Received ${data.artists?.length || 0} related artists`);
        setRelatedArtists(data.artists || []);
        setError(null);
      })
      .catch(err => {
        console.error("Error fetching related artists:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [artistId, accessToken]);

  if (loading) return <p>Loading related artists...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (relatedArtists.length === 0) return <p>No related artists found.</p>;

  return (
    <div>
      <h2>Related Artists</h2>
      <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
        {relatedArtists.map(artist => (
          <li key={artist.id} style={{ marginBottom: 8 }}>
            <a
              href={artist.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'blue', textDecoration: 'underline' }}
            >
              {artist.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RelatedArtists;