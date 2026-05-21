import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#1A1A2E',
      color: 'white',
      fontFamily: 'sans-serif'
    }}>
      <h1>🌸 Ohayo Room</h1>
      <p>Real-time Japanese Speaking Practice</p>
      <p>Coming Soon...</p>
      <button 
        onClick={() => setCount(c => c + 1)}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          borderRadius: '8px',
          border: 'none',
          background: '#FF6B9D',
          color: 'white',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Clicked {count} times
      </button>
    </div>
  );
}

export default App;