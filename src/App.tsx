import { useState, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import BoxClock from './components/BoxClock';
import './index.css';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontMode, setFontMode] = useState<'oi' | 'montserrat'>('oi');
  const [spinTrigger, setSpinTrigger] = useState(0);

  const handleSpin = useCallback(() => {
    setSpinTrigger(prev => prev + 1);
  }, []);

  const bgColor = isDarkMode ? '#000000' : '#ffffff';
  const textColor = isDarkMode ? '#ffffff' : '#000000';

  return (
    <div style={{ width: '100vw', height: '100vh', background: bgColor, position: 'relative' }}>
      {/* Top Left UI Controls */}
      <div className="ui-container">
        {/* Font Toggle */}
        <button
          className="minimal-toggle"
          onClick={() => setFontMode(prev => prev === 'oi' ? 'montserrat' : 'oi')}
          title={`Switch to ${fontMode === 'oi' ? 'Montserrat' : 'Oi'}`}
          style={{ color: textColor }}
        >
          <span className="font-icon">
            {fontMode === 'oi' ? 'Oi' : 'Mt'}
          </span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          className="minimal-toggle"
          onClick={() => setIsDarkMode(!isDarkMode)}
          title="Toggle Dark Mode"
          style={{ color: textColor }}
        >
          {isDarkMode ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>

      {/* Spin Button */}
      <button
        onClick={handleSpin}
        className="spin-button"
        style={{
          backgroundColor: isDarkMode ? '#ffffff' : '#000000',
          color: isDarkMode ? '#000000' : '#ffffff',
        }}
      >
        SPIN
      </button>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 18], fov: 50 }}>
        <color attach="background" args={[bgColor]} />
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />

        <Suspense fallback={null}>
          <BoxClock isDarkMode={isDarkMode} spinTrigger={spinTrigger} fontMode={fontMode} />
        </Suspense>

        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}

export default App;
