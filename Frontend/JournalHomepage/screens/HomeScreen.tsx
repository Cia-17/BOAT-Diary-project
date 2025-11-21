import React from 'react';
import { DateSelector } from '../components/DateSelector';
import { MainJournalCard, QuickActions } from '../components/JournalCards';

interface Props {
  onNavigate: (screen: 'entry') => void;
}

export const HomeScreen: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="flex min-h-screen flex-col bg-sun-beige px-6 pb-24 pt-8">
      {/* Header */}
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sun-text">Hi, Jose Maria</h1>
          <p className="text-sm text-sun-subtext">Ready to write?</p>
        </div>
        <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-md">
          <img
            src="https://picsum.photos/seed/jose/200/200"
            alt="Profile"
            className="h-full w-full object-cover"
          />
        </div>
      </header>

      {/* Date Selector */}
      <DateSelector />

      {/* Journal Section */}
      <div className="mt-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-sun-text">My Journal</h2>
          <button className="text-sm font-medium text-sun-subtext">View All</button>
        </div>
        <MainJournalCard onEntryClick={() => onNavigate('entry')} />
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
};