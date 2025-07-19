const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: process.env.FRONTEND_URI || '*', // Allow requests from frontend
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

function generateRandomString(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// Root route to verify the server is running
app.get('/', (req, res) => {
  res.send('Vibent API is running! Go to /login to authenticate with Spotify.');
});

app.get('/login', (req, res) => {
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

app.get("/callback", async (req, res) => {
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

    const { access_token, refresh_token } = response.data;

    // Redirect to frontend with tokens in query string
    res.redirect(`${frontend_uri}/?access_token=${access_token}&refresh_token=${refresh_token}`);
  } catch (error) {
    console.error('Error in /callback:', error.response?.data || error.message);
    res.status(500).send('Callback failed 😢');
  }
});

app.get('/refresh_token', async (req, res) => {
  const refresh_token = req.query.refresh_token;
  if (!refresh_token) return res.status(400).send('No refresh_token provided');

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
        },
      }
    );

    res.json({ access_token: response.data.access_token });
  } catch (error) {
    console.error('Error refreshing token:', error.response?.data || error.message);
    res.status(500).send('Failed to refresh access token');
  }
});

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
    res.status(500).json({ error: 'Failed to fetch related artists' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});