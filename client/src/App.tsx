import React, { useEffect, useState } from 'react';
import axios from 'axios';

const App: React.FC = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState<string | null>(null);

  // Function to get access token from URL and request the user data from backend
  const handleCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('access_token');  // Extract access token from URL

    console.log('Received access token:', token);  // Add logging here

    if (!token) {
      setError('Access token is missing.');
      return;
    }

    // Save the access token in the state
    setAccessToken(token);

    // Optionally, fetch user data from Calendly
    // fetchUserData(token);
  };

  // Fetch user data using the access token
  const fetchUserData = async (token: string) => {
    try {
      const response = await axios.get('http://localhost:5000/user-data', {
        params: { access_token: token },
      });
      setUserData(response.data);
    } catch (err) {
      setError('Error fetching user data.');
    }
  };

  useEffect(() => {
    // If the callback URL is loaded, handle the code exchange
    if (window.location.search.includes('access_token=')) {
      handleCallback();
    }
  }, []);

  return (
    <div className="App">
      <h1>Calendly OAuth Integration</h1>
      {!accessToken ? (
        <button onClick={() => (window.location.href = 'http://localhost:5000/auth')}>
          Login with Calendly
        </button>
      ) : (
        <>
          <p>Access Token: {accessToken}</p>
          <button onClick={() => fetchUserData(accessToken)}>Fetch User Data</button>
        </>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {userData && (
        <div>
          <h2>User Data:</h2>
          <pre>{JSON.stringify(userData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default App;
