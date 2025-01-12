import React, { useEffect, useState } from "react";
import axios from "axios";

const App: React.FC = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [eventTypes, setEventTypes] = useState([]);

  useEffect(() => {
    console.log("eventTypes:", eventTypes);
  }, [eventTypes]);

  useEffect(() => {
    console.log("accessToken:", accessToken);
  }, [accessToken]);

  const fetchEventTypes = async () => {
    if (!accessToken) return;
  
    try {
      const response = await axios.get('http://localhost:5000/event-types', {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Include Authorization header
        },
      });
      setEventTypes(response.data.collection); // Event types are in the "collection" key
    } catch (err) {
      console.error(err);
      setError('Error fetching event types.');
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchEventTypes();
    }
  }, [accessToken]);

  const handleCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("access_token");

    if (!token) {
      setError("Access token is missing.");
      return;
    }

    setAccessToken(token);
  };

  const fetchUserData = async (token: string) => {
    try {
      const response = await axios.get("http://localhost:5000/user-data", {
        params: { access_token: token },
      });
      setUserData(response.data);
    } catch {
      setError("Error fetching user data.");
    }
  };

  useEffect(() => {
    if (window.location.search.includes("access_token=")) {
      handleCallback();
    }
  }, []);

  return (
    <div className="App">
      <h1>Calendly OAuth Integration</h1>
      {!accessToken ? (
        <button
          onClick={() => (window.location.href = "http://localhost:5000/auth")}
        >
          Login with Calendly
        </button>
      ) : (
        <>
          <p>Access Token: {accessToken}</p>
          <button onClick={() => fetchUserData(accessToken)}>
            Fetch User Data
          </button>
        </>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
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
