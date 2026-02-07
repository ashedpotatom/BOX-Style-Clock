import { useState, useCallback, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import BoxClock from './components/BoxClock';

const SOUNDS = [
  { id: 'none', label: 'OFF', url: '' },
  { id: 'click', label: 'CLICK', url: '/assets/sounds/click.mp3' },
  { id: 'snap', label: 'SNAP', url: '/assets/sounds/snap.mp3' },
  { id: 'tech', label: 'TECH', url: '/assets/sounds/tech.mp3' },
  { id: 'tic', label: 'TIC', url: '/assets/sounds/tic.mp3' },
];
import './index.css';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontMode, setFontMode] = useState<'oi' | 'montserrat'>('oi');
  const [spinTrigger, setSpinTrigger] = useState(0);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [selectedSound, setSelectedSound] = useState(SOUNDS[0]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSpin = useCallback(() => {
    setSpinTrigger(prev => prev + 1);
  }, []);

  const playPreview = (sound: typeof SOUNDS[0]) => {
    setSelectedSound(sound);
  };

  const bgColor = isDarkMode ? '#000000' : '#ffffff';

  return (
    <div style={{ width: '100vw', height: '100vh', background: bgColor, position: 'relative' }}>
      {/* UI Controls - Top Right */}
      <div className="ui-container">
        {/* Sound Selection */}
        <div className="sound-container">
          {SOUNDS.map(s => (
            <button
              key={s.id}
              onClick={() => playPreview(s)}
              className={`minimal-toggle font-icon ${selectedSound.id === s.id ? 'active' : ''}`}
              style={{ padding: '4px 8px', fontSize: '10px', width: 'auto', borderRadius: '4px' }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Font Toggle */}
        <button
          onClick={() => setFontMode(fontMode === 'oi' ? 'montserrat' : 'oi')}
          className="minimal-toggle"
        >
          <div className="font-icon" style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
            {fontMode === 'oi' ? 'Oi' : 'Mt'}
          </div>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="minimal-toggle"
        >
          {isDarkMode ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>
      </div>

      {/* Spin Button */}
      <button
        onClick={handleSpin}
        className="spin-button"
        style={{
          bottom: isMobile ? '60px' : '40px',
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
          <BoxClock
            isDarkMode={isDarkMode}
            spinTrigger={spinTrigger}
            fontMode={fontMode}
            isMobile={isMobile}
            soundUrl={selectedSound.url}
          />
        </Suspense>

        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}

export default App;
