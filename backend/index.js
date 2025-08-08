const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const cors = require('cors');
const dotenv = require('dotenv');
const Amadeus = require('amadeus');

dotenv.config();

const app = express();
app.use(express.json());

// Amadeus credentials from env
const AMADEUS_CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;

// Spotify + Ticketmaster env variables
const PORT = process.env.PORT || 3000;
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;
const frontend_uri = process.env.FRONTEND_URI || 'https://vibent-hdvq.vercel.app';
const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;

// Logging environment variables status
console.log('AMADEUS_CLIENT_ID:', AMADEUS_CLIENT_ID ? '✓ Set' : '❌ Missing');
console.log('AMADEUS_CLIENT_SECRET:', AMADEUS_CLIENT_SECRET ? '✓ Set' : '❌ Missing');
console.log('SPOTIFY_CLIENT_ID:', client_id ? '✓ Set' : '❌ Missing');
console.log('SPOTIFY_CLIENT_SECRET:', client_secret ? '✓ Set' : '❌ Missing');
console.log('REDIRECT_URI:', redirect_uri || '❌ Missing');
console.log('FRONTEND_URI:', frontend_uri || '❌ Missing');
console.log('TICKETMASTER_API_KEY:', TICKETMASTER_API_KEY ? '✓ Set' : '❌ Missing');
console.log('PORT:', PORT);

// CORS setup
app.use(cors({
  origin: '*',
  methods: 'GET,POST,PUT,DELETE',
  credentials: true
}));

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.send('Vibent API is running! Go to /login to authenticate with Spotify.');
});

// Test route
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Test route working',
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasClientId: !!client_id,
      hasClientSecret: !!client_secret,
      redirectUri: redirect_uri,
      frontendUri: frontend_uri,
      hasTicketmasterKey: !!TICKETMASTER_API_KEY
    }
  });
});

// Login route
app.get('/login', (req, res) => {
  console.log('Login route accessed');
  
  if (!client_id) {
    console.error('SPOTIFY_CLIENT_ID is not defined');
    return res.status(500).send('Server configuration error: Missing Spotify client ID');
  }
  
  const scope = 'user-read-private user-read-email user-top-read';
  
  const authQueryParams = new URLSearchParams({
    response_type: 'code',
    client_id: client_id,
    scope: scope,
    redirect_uri: redirect_uri,
  });

  const authUrl = `https://accounts.spotify.com/authorize?${authQueryParams.toString()}`;

  console.log('Redirecting to:', authUrl);
  res.redirect(authUrl);
});

// Callback route
app.get("/callback", async (req, res) => {
  console.log('Callback route accessed');
  const code = req.query.code || null;

  if (!code) {
    return res.status(400).send('No code provided');
  }

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token',
      querystring.stringify({
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
        },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;

    // Redirect to frontend with tokens in query string
    const redirectUrl = `${frontend_uri}/?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`;
    console.log('Redirecting to frontend:', redirectUrl);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error in /callback:', error.response?.data || error.message);
    res.status(500).send('Callback failed: ' + (error.response?.data?.error || error.message));
  }
});

// Refresh token endpoint
app.get('/refresh_token', async (req, res) => {
  const refresh_token = req.query.refresh_token;
  
  if (!refresh_token) {
    return res.status(400).send('No refresh token provided');
  }

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: refresh_token,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
        },
      }
    );

    res.json({
      access_token: response.data.access_token,
      expires_in: response.data.expires_in
    });
  } catch (error) {
    console.error('Error refreshing token:', error.response?.data || error.message);
    res.status(500).send('Failed to refresh access token: ' + (error.response?.data?.error || error.message));
  }
});

// Related artists endpoint
app.get('/related-artists/:artistId', async (req, res) => {
  const artistId = req.params.artistId;
  const access_token = req.query.access_token;

  if (!access_token) {
    return res.status(400).json({ error: 'Access token required as query param' });
  }

  try {
    const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/related-artists`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching related artists:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch related artists',
      details: error.response?.data || error.message
    });
  }
});

// Concerts endpoint with optional city/state filtering
app.get('/concerts', async (req, res) => {
  try {
    const artistName = req.query.artistName ? req.query.artistName.trim() : '';
    const city = req.query.city ? req.query.city.trim().toLowerCase() : '';
    const state = req.query.state ? req.query.state.trim().toLowerCase() : '';

    if (!artistName || artistName.length > 100) {
      return res.status(400).json({ error: 'Artist name is required and must be less than 100 characters' });
    }

    if (!TICKETMASTER_API_KEY) {
      console.error('TICKETMASTER_API_KEY is not defined');
      return res.status(500).json({ error: 'Server configuration error: Missing Ticketmaster API key' });
    }

    console.log(`Fetching concerts for ${artistName} with filters - city: ${city}, state: ${state}`);
    
    const apiUrl = `https://app.ticketmaster.com/discovery/v2/events.json`;
    const response = await axios.get(apiUrl, {
      params: {
        keyword: artistName,
        apikey: TICKETMASTER_API_KEY,
        size: 20,
        sort: 'date,asc',
      },
    });

    const events = response.data._embedded ? response.data._embedded.events : [];

    const formattedEvents = events.map(event => {
      const venue = event._embedded?.venues?.[0];
      return {
        id: event.id,
        name: event.name,
        date: event.dates.start.localDate,
        time: event.dates.start.localTime || null,
        venue: venue?.name || 'Unknown Venue',
        city: venue?.city?.name || '',
        state: venue?.state?.name || venue?.state?.stateCode || '',
        country: venue?.country?.name || venue?.country?.countryCode || '',
        url: event.url,
        images: event.images || [],
        priceRanges: event.priceRanges || []
      };
    });

    // Optional city/state filtering
    const filteredEvents = formattedEvents.filter(event => {
      const matchesCity = city ? event.city.toLowerCase().includes(city) : true;
      const matchesState = state ? event.state.toLowerCase().includes(state) : true;
      return matchesCity && matchesState;
    });

    return res.json({ events: filteredEvents });
  } catch (error) {
    console.error('Error fetching concerts:', error.response?.data || error.message);
    return res.status(500).json({ 
      error: 'Failed to fetch concerts', 
      details: error.response?.data || error.message 
    });
  }
});

let amadeusAccessToken = null;
let amadeusTokenExpiresAt = 0;

async function getAmadeusAccessToken() {
  try {
    const response = await axios.post('https://test.api.amadeus.com/v1/security/oauth2/token',
      querystring.stringify({
        grant_type: 'client_credentials',
        client_id: AMADEUS_CLIENT_ID,
        client_secret: AMADEUS_CLIENT_SECRET,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    amadeusAccessToken = response.data.access_token;
    // Set expiry time a bit earlier than actual to refresh in time
    amadeusTokenExpiresAt = Date.now() + (response.data.expires_in - 60) * 1000;

    console.log('Obtained new Amadeus access token');
    return amadeusAccessToken;
  } catch (error) {
    console.error('Failed to get Amadeus access token:', error.response?.data || error.message);
    throw error;
  }
}

async function ensureAmadeusAccessToken() {
  if (!amadeusAccessToken || Date.now() > amadeusTokenExpiresAt) {
    return await getAmadeusAccessToken();
  }
  return amadeusAccessToken;
}

// Flights route
app.get('/flights', async (req, res) => {
  const { origin, destination, departureDate } = req.query;

  if (!origin || !destination || !departureDate) {
    return res.status(400).json({ error: 'origin, destination, and departureDate query parameters are required' });
  }

  try {
    await ensureAmadeusAccessToken();

    const flightsRes = await axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
      headers: { Authorization: `Bearer ${amadeusAccessToken}` },
      params: {
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate: departureDate,
        adults: 1,
        max: 5
      }
    });

    res.json(flightsRes.data);
  } catch (error) {
    console.error('Error fetching flights:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error fetching flights' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
