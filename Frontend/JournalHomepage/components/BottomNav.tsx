import React from 'react';
import { Home, Compass, Plus, Map, User } from 'lucide-react';
import { NavItemProps } from '../types';

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, isActive, onClick, isCenter }) => {
  if (isCenter) {
    return (
      <button
        onClick={onClick}
        className="relative -top-6 flex h-14 w-14 items-center justify-center rounded-full bg-sun-text text-white shadow-lg transition-transform active:scale-95"
      >
        <Icon size={24} strokeWidth={2.5} />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 transition-all ${isActive ? 'text-sun-text' : 'text-gray-400'}`}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${isActive ? 'bg-sun-yellow' : 'bg-transparent'}`}>
        <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
      </div>
    </button>
  );
};

interface BottomNavProps {
  currentScreen: string;
  setCurrentScreen: (screen: any) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, setCurrentScreen }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 px-6 pb-6 pt-2 backdrop-blur-md">
      <div className="flex items-center justify-between px-2">
        <NavItem
          icon={Home}
          label="Home"
          isActive={currentScreen === 'home'}
          onClick={() => setCurrentScreen('home')}
        />
        <NavItem
          icon={Compass}
          label="Explore"
          isActive={false}
          onClick={() => {}}
        />
        <NavItem
          icon={Plus}
          label="Add"
          isCenter
          onClick={() => setCurrentScreen('stats')} // Using Add to trigger Stats for demo flow
        />
        <NavItem
          icon={Map}
          label="Journey"
          isActive={currentScreen === 'stats'}
          onClick={() => setCurrentScreen('stats')}
        />
        <NavItem
          icon={User}
          label="Profile"
          isActive={false}
          onClick={() => {}}
        />
      </div>
    </div>
  );
};