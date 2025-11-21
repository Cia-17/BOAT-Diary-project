import React from 'react';
import { Sun, Moon, Edit3, Heart, Coffee, ChevronRight } from 'lucide-react';

interface Props {
  onEntryClick: () => void;
}

export const MainJournalCard: React.FC<Props> = ({ onEntryClick }) => {
  return (
    <div className="flex h-48 w-full gap-3">
      {/* Morning Card */}
      <div
        onClick={onEntryClick}
        className="relative flex flex-1 cursor-pointer flex-col justify-between overflow-hidden rounded-3xl bg-[#E6F4F1] p-5 transition-transform active:scale-95"
      >
        {/* Background Illustration Elements */}
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#FFD54F] opacity-50 blur-xl"></div>
        <div className="absolute bottom-0 left-0 right-0 h-24 translate-y-10 rounded-[50%] bg-[#D1EBE6]"></div>

        <div className="relative z-10">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
             <Sun className="text-orange-400" size={20} />
          </div>
          <h3 className="text-2xl font-serif font-medium text-sun-text">Let's start your day.</h3>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-600">Begin with mindful morning reflections.</p>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/50">
            <ChevronRight size={16} />
          </div>
        </div>
      </div>

      {/* Evening Pill Tab */}
      <div className="flex w-14 flex-col items-center justify-center rounded-full bg-slate-800 py-4 text-white transition-transform active:scale-95">
        <Moon size={18} className="mb-auto text-sun-yellow" />
        <span className="writing-vertical-rl rotate-180 text-sm font-medium tracking-wide">Evening</span>
      </div>
    </div>
  );
};

export const QuickActions: React.FC = () => {
  const actions = [
    { title: 'Pause & Reflect', icon: Edit3, bg: 'bg-rose-100', text: 'text-rose-800', tag: 'Today' },
    { title: 'Set Intentions', icon: Coffee, bg: 'bg-amber-100', text: 'text-amber-800', tag: 'Personal' },
    { title: 'Emotions', icon: Heart, bg: 'bg-indigo-100', text: 'text-indigo-800', tag: 'Family' },
  ];

  return (
    <div className="mt-6">
      <h3 className="mb-4 text-lg font-bold text-sun-text">Quick Journal</h3>
      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
        {actions.map((action, idx) => (
          <div
            key={idx}
            className={`flex h-32 min-w-[140px] flex-col justify-between rounded-2xl ${action.bg} p-4 transition-transform active:scale-95`}
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/60 ${action.text}`}>
              <action.icon size={14} />
            </div>
            <div>
              <h4 className="mb-1 text-sm font-bold leading-tight text-gray-800">{action.title}</h4>
              <span className="inline-block rounded-md bg-white/50 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                {action.tag}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};