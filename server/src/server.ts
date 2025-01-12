import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
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

// Callback route
app.get('/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    res.status(400).send('Authorization code is missing.');
  }

  const clientId = process.env.CALENDLY_CLIENT_ID!;
  const clientSecret = process.env.CALENDLY_CLIENT_SECRET!;
  const redirectUri = process.env.CALENDLY_REDIRECT_URI!;

  try {
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

    const { access_token } = response.data;
    if (!access_token) {
      res.status(500).send('Access token not found.');
    }

    res.redirect(`${process.env.FRONTEND_URL}/callback?access_token=${access_token}`);
  } catch (error: any) {
    res.status(500).send('Error during authentication.');
  }
});

// Fetch user data
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
    return res.status(500).send('Error fetching user data.');
  }
});

app.get('/event-types', async (req, res) => {
  const authHeader = req.headers.authorization;

  console.log('Authorization Header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(400).json({ error: 'Authorization token is missing or invalid.' });
  }

  const accessToken = authHeader.split(' ')[1];

  try {

    const userResponse = await axios.get('https://api.calendly.com/users/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userUri = userResponse.data.resource.uri;
    console.log('User URI:', userUri);


    const response = await axios.get('https://api.calendly.com/event_types', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        user: userUri,
      },
    });

    console.log('Event Types:', response.data);

    return res.json(response.data);
  } catch (error: any) {
    console.error('Error fetching event types:', error.response?.data || error.message);

    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data || 'Internal Server Error';

    return res.status(statusCode).json({
      error: errorMessage,
    });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
