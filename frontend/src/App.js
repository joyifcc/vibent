// App.js
import React, { useEffect, useState } from 'react';
import TopArtistsList from './components/TopArtistsList';
import RelatedArtistsList from './components/RelatedArtistsList';

function App() {
  const [topArtists, setTopArtists] = useState([]);
  const [relatedArtists, setRelatedArtists] = useState([]);

  useEffect(() => {
    const fetchTopArtists = async () => {
      // fetch top artists logic here
      // setTopArtists(response.data.items);
    };

    const fetchRelatedArtists = async () => {
      // fetch related artists logic here (optional if you do it on top artist selection)
      // setRelatedArtists(response.data.artists);
    };

    fetchTopArtists();
    fetchRelatedArtists(); // optional, depending on app logic
  }, []);

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', color: 'white' }}>
      <TopArtistsList topArtists={topArtists} />
      <RelatedArtistsList relatedArtists={relatedArtists} /> {/* ✅ added */}
    </div>
  );
}

export default App;
