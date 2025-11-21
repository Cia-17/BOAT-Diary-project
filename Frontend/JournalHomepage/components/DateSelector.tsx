import React from 'react';

export const DateSelector: React.FC = () => {
  const dates = [
    { day: 'M', date: 18, active: false },
    { day: 'T', date: 19, active: false },
    { day: 'W', date: 20, active: false },
    { day: 'T', date: 21, active: false },
    { day: 'F', date: 22, active: true },
    { day: 'S', date: 23, active: false },
    { day: 'S', date: 24, active: false },
  ];

  return (
    <div className="flex w-full justify-between py-4">
      {dates.map((item, index) => (
        <button
          key={index}
          className={`flex flex-col items-center justify-center gap-1 transition-all active:scale-95`}
        >
          <span className="text-xs font-medium text-sun-subtext">{item.day}</span>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors ${
              item.active
                ? 'bg-sun-yellow text-sun-text shadow-sm'
                : 'bg-transparent text-sun-text'
            }`}
          >
            {item.date}
          </div>
        </button>
      ))}
    </div>
  );
};