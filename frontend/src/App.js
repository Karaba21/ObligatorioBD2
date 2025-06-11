import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/message');
        setMessage(response.data.message);
      } catch (error) {
        console.error('Error fetching message:', error);
        setMessage('Error al cargar el mensaje');
      }
    };

    fetchMessage();
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>{message}</h1>
    </div>
  );
}

export default App; 