import axios from 'axios';

const CALENDLY_API_BASE = 'https://api.calendly.com';
const AUTH_TOKEN = process.env.CALENDLY_TOKEN;

export const calendlyClient = axios.create({
  baseURL: CALENDLY_API_BASE,
  headers: {
    Authorization: `Bearer ${AUTH_TOKEN}`,
  },
});
