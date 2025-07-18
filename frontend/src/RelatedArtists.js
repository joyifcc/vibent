import React, { useEffect, useState } from 'react';

function RelatedArtists({ artistId, accessToken }) {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!artistId || !accessToken) return;

    setLoading(true);
    setError(null);

    fetch(`http://localhost:8888/related-artists/${artistId}?access_token=${accessToken}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setRelated(data.artists || []);
        }
      })
      .catch(() => setError('Failed to fetch related artists'))
      .finally(() => setLoading(false));
  }, [artistId, accessToken]);

  if (loading) return <p>Loading related artists...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!related.length) return <p>No related artists found.</p>;

  return (
    <div>
      <h3>Related Artists</h3>
      <ul>
        {related.map(artist => (
          <li key={artist.id}>{artist.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default RelatedArtists;
