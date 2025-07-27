const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const cors = require('cors');
const dotenv = require('dotenv');
const NodeCache = require('node-cache'); // You'll need to install this: npm install node-cache

// Load environment variables
dotenv.config();

const app = express();

// Initialize cache for concerts
const concertCache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Enable CORS for all routes
app.use(cors({
  origin: '*', // Allow all origins during testing
  methods: 'GET,POST,PUT,DELETE',
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

const PORT = process.env.PORT || 8888;

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;
const frontend_uri = process.env.FRONTEND_URI || 'https://vibent-hdvq.vercel.app';
const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;

// Log environment variables
console.log('Environment Variables Check:');
console.log('SPOTIFY_CLIENT_ID:', client_id ? '✓ Set' : '❌ Missing');
console.log('SPOTIFY_CLIENT_SECRET:', client_secret ? '✓ Set' : '❌ Missing');
console.log('REDIRECT_URI:', redirect_uri || '❌ Missing');
console.log('FRONTEND_URI:', frontend_uri || '❌ Missing');
console.log('TICKETMASTER_API_KEY:', TICKETMASTER_API_KEY ? '✓ Set' : '❌ Missing');
console.log('PORT:', PORT);

// Root route to verify the server is running
app.get('/', (req, res) => {
  console.log('Root route accessed');
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

  const authUrl = `[https://accounts.spotify.com/authorize?${authQueryParams.toString()}`](https://accounts.spotify.com/authorize?${authQueryParams.toString()}`);

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

// Related artists endpoint - Fix malformed URL
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

// Login route - Fix malformed URL
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

// Concerts endpoint - Fix caching variable name and optional chaining
app.get('/concerts', async (req, res) => {
  try {
    // Input validation
    const artistName = req.query.artistName ? req.query.artistName.trim() : '';
    
    if (!artistName || artistName.length > 100) {
      return res.status(400).json({ error: 'Artist name is required and must be less than 100 characters' });
    }

    if (!TICKETMASTER_API_KEY) {
      console.error('TICKETMASTER_API_KEY is not defined');
      return res.status(500).json({ error: 'Server configuration error: Missing Ticketmaster API key' });
    }
    
    // Check cache first
    const cacheKey = `concerts_${artistName.toLowerCase()}`;
    const cachedData = concertCache.get(cacheKey);
    
    if (cachedData) {
      console.log(`Returning cached concerts for ${artistName}`);
      return res.json(cachedData);
    }

    // Add the rest of the concerts endpoint logic here
    // ...
  } catch (error) {
    console.error('Error fetching concerts:', error.message);
    return res.status(500).json({ error: 'Failed to fetch concerts', details: error.message });
  }
});