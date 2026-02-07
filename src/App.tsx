import { useState, useCallback, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import BoxClock from './components/BoxClock';

const SOUNDS = [
  { id: 'none', label: 'OFF', url: '', volume: 0 },
  { id: 'click', label: 'CLICK', url: '/assets/sounds/click.mp3', volume: 0.4 },
  { id: 'snap', label: 'SNAP', url: '/assets/sounds/snap.mp3', volume: 0.4 },
  { id: 'tech', label: 'TECH', url: '/assets/sounds/tech.mp3', volume: 0.24 },
  { id: 'tic', label: 'TIC', url: '/assets/sounds/tic.mp3', volume: 0.4 },
];
import './index.css';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontMode, setFontMode] = useState<'gloock' | 'montserrat' | 'custom'>('gloock');
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


  const bgColor = isDarkMode ? '#000000' : '#ffffff';

  return (
    <div className={isDarkMode ? 'dark' : ''} style={{ width: '100vw', height: '100vh', background: bgColor, position: 'relative' }}>
      {/* UI Controls - Top Right */}
      <div className="ui-container">
        {/* Sound Selection Toggle */}
        <button
          onClick={() => {
            const currentIndex = SOUNDS.findIndex(s => s.id === selectedSound.id);
            const nextIndex = (currentIndex + 1) % SOUNDS.length;
            setSelectedSound(SOUNDS[nextIndex]);
          }}
          className="minimal-toggle font-icon"
          style={{
            padding: '4px 10px',
            width: 'auto',
            color: isDarkMode ? '#ffffff' : '#000000'
          }}
        >
          Vol: {selectedSound.label}
        </button>

        <button
          onClick={() => {
            if (fontMode === 'gloock') setFontMode('montserrat');
            else if (fontMode === 'montserrat') setFontMode('custom');
            else setFontMode('gloock');
          }}
          className="minimal-toggle font-icon"
          style={{
            padding: '4px 10px',
            width: 'auto',
            color: isDarkMode ? '#ffffff' : '#000000'
          }}
        >
          Font: {fontMode === 'gloock' ? 'Gloock' : fontMode === 'montserrat' ? 'Mt' : 'Sprat'}
        </button>

        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="minimal-toggle font-icon"
          style={{
            padding: '4px 10px',
            width: 'auto',
            color: isDarkMode ? '#ffffff' : '#000000'
          }}
        >
          Mode: {isDarkMode ? 'Light' : 'Dark'}
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
            soundVolume={selectedSound.volume}
          />
        </Suspense>

        <OrbitControls
          enableZoom={true}
          minDistance={10}
          maxDistance={40}
        />
      </Canvas>
    </div>
  );
}

export default App;
