import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Frontend URL
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Start OAuth flow
app.get('/auth', (_req, res) => {
  const clientId = process.env.CALENDLY_CLIENT_ID!;
  const redirectUri = process.env.CALENDLY_REDIRECT_URI!;
  const url = `https://calendly.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
  res.redirect(url);
});

// Callback route where Calendly redirects after user authorization
// Callback route where Calendly redirects after user authorization
app.get('/callback', async (req, res) => {
  const { code } = req.query; // Get the authorization code from the URL

  console.log('Received code:', code);  // Add logging here

  if (!code) {
    res.status(400).send('Authorization code is missing.');
  }

  const clientId = process.env.CALENDLY_CLIENT_ID!;
  const clientSecret = process.env.CALENDLY_CLIENT_SECRET!;
  const redirectUri = process.env.CALENDLY_REDIRECT_URI!;

  try {
    // Exchange the code for an access token
    const response = await axios.post(
      'https://calendly.com/oauth/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    console.log('Calendly Response:', response.data);  // Add logging for the response

    const { access_token } = response.data;
    if (!access_token) {
      console.error('Access token not found');
      res.status(500).send('Access token not found.');
    }

    // Redirect to frontend with access token in URL
    res.redirect(`${process.env.FRONTEND_URL}/callback?access_token=${access_token}`);
  } catch (error: any) {
    console.error('Error during authentication', error.response ? error.response.data : error.message);
    res.status(500).send('Error during authentication.');
  }
});


// Fetch user data from Calendly
app.get('/user-data', async (req, res) => {
  const { access_token } = req.query;
  if (!access_token) {
    return res.status(400).send('Access token is missing.');
  }

  try {
    const response = await axios.get('https://api.calendly.com/users/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return res.json(response.data);
  } catch (error) {
    console.error('Error fetching user data', error);
    return res.status(500).send('Error fetching user data.');
  }
});

// Schedule an event in the logged-in user's calendar
app.post('/schedule', async (req, res) => {
  const { access_token, event_type_uuid, start_time } = req.body;

  if (!access_token || !event_type_uuid || !start_time) {
    return res.status(400).send('Missing required parameters.');
  }

  try {
    const response = await axios.post(
      'https://api.calendly.com/scheduled_events',
      {
        event_type: event_type_uuid,
        start_time,
        end_time: start_time, // Placeholder, adjust according to the actual event
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return res.json(response.data); // Return the scheduled event details
  } catch (error) {
    console.error('Error scheduling event', error);
    return res.status(500).send('Error scheduling event.');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
