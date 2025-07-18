const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 8888;

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;
const frontend_uri = process.env.FRONTEND_URI;

function generateRandomString(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

app.get("/login", (req, res) => {
  const scope = "user-read-private user-read-email";
  const authUrl =
    "https://accounts.spotify.com/authorize" +
    "?response_type=code" +
    "&client_id=" + encodeURIComponent(process.env.SPOTIFY_CLIENT_ID) +
    "&scope=" + encodeURIComponent(scope) +
    "&redirect_uri=" + encodeURIComponent(process.env.REDIRECT_URI);

  res.redirect(authUrl);
});

app.get("/callback", async (req, res) => {
  const code = req.query.code || null;

  const authOptions = {
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
        ).toString("base64"),
    },
    body: new URLSearchParams({
      code: code,
      redirect_uri: process.env.REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  };

  try {
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", authOptions);
    const tokenData = await tokenRes.json();

    const access_token = tokenData.access_token;
    const refresh_token = tokenData.refresh_token;

    // ✅ Redirect to your frontend with tokens OR store them
    res.redirect(`http://localhost:3000/?access_token=${access_token}&refresh_token=${refresh_token}`);
  } catch (err) {
    console.error("Error in /callback:", err);
    res.send("Callback failed 😢");
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
