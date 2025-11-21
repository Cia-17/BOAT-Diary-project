import React, { useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './screens/HomeScreen';
import { StatsScreen } from './screens/StatsScreen';
import { EntryScreen } from './screens/EntryScreen';
import { ScreenType } from './types';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={(screen) => setCurrentScreen(screen as ScreenType)} />;
      case 'stats':
        return <StatsScreen />;
      case 'entry':
        return <EntryScreen onBack={() => setCurrentScreen('home')} />;
      default:
        return <HomeScreen onNavigate={(screen) => setCurrentScreen(screen as ScreenType)} />;
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-md bg-sun-beige shadow-2xl sm:overflow-hidden sm:border-x sm:border-gray-200">
      {renderScreen()}
      
      {/* Hide BottomNav when on Entry screen for cleaner look, or keep it based on preference. 
          The prompt implies a persistent nav, but usually detail views hide it. 
          I will hide it on Entry to match typical mobile patterns, show on others. */}
      {currentScreen !== 'entry' && (
        <BottomNav currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
      )}
    </div>
  );
};

export default App;