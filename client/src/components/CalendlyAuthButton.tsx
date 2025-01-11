// src/components/CalendlyAuthButton.tsx
import React from 'react';

const CalendlyAuthButton: React.FC = () => {
  const handleAuth = () => {
    // Redirect to backend OAuth route
    window.location.href = 'http://localhost:5000/auth'; // Make sure this matches your backend route
  };

  return (
    <button onClick={handleAuth}>Authenticate with Calendly</button>
  );
};

export default CalendlyAuthButton;
