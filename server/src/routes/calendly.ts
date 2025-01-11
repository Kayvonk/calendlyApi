import { Router } from 'express';
// import { calendlyClient } from '../utils/calendlyClient';

const router = Router();

router.get('/me', async (_req, res) => {
  try {
    // const response = await calendlyClient.get('/users/me');
    // res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Calendly data' });
  }
});

router.get('/events', async (_req, res) => {
  try {
    // const response = await calendlyClient.get('/scheduled_events');
    // res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

export default router;
