import React from 'react';
import { BarChart, Bar, XAxis, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { EmotionData } from '../types';

const data: EmotionData[] = [
  { name: 'Happy', value: 45, fill: '#FCD34D' },   // sun-yellow
  { name: 'Sad', value: 15, fill: '#9CA3AF' },     // gray-400
  { name: 'Calm', value: 30, fill: '#93C5FD' },    // blue-300
  { name: 'Anxious', value: 10, fill: '#FCA5A5' }, // red-300
];

export const StatsScreen: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-sun-beige px-6 pb-24 pt-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-sun-text">Mood Stats</h1>
        <p className="text-sun-subtext">Your emotional journey this week.</p>
      </header>

      <div className="flex-1">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-sun-text">Weekly Overview</h2>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#78716C', fontSize: 12, fontWeight: 500 }} 
                  dy={10}
                />
                <Bar dataKey="value" radius={[20, 20, 20, 20]} barSize={40}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <LabelList 
                    dataKey="value" 
                    position="top" 
                    formatter={(val: number) => `${val}%`} 
                    style={{ fill: '#44403C', fontSize: 12, fontWeight: 'bold' }} 
                    offset={10}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights Section */}
        <div className="mt-6 grid grid-cols-2 gap-4">
             <div className="rounded-2xl bg-sun-surface p-4">
                 <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Dominant</p>
                 <p className="text-xl font-bold text-sun-text">Happy</p>
                 <p className="mt-1 text-xs text-gray-500">45% of entries</p>
             </div>
             <div className="rounded-2xl bg-sun-surface p-4">
                 <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total</p>
                 <p className="text-xl font-bold text-sun-text">12</p>
                 <p className="mt-1 text-xs text-gray-500">Entries this week</p>
             </div>
        </div>
      </div>

      <button className="mt-8 w-full rounded-2xl bg-sun-yellow py-4 text-center font-bold text-sun-text shadow-lg shadow-yellow-100 transition-transform active:scale-95">
        Create a New Journal
      </button>
    </div>
  );
};