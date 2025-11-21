import React from 'react';
import { ArrowLeft, Play, Pause, MoreHorizontal, Share2 } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export const EntryScreen: React.FC<Props> = ({ onBack }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);

  return (
    <div className="relative min-h-screen bg-sun-beige pb-10 pt-8">
      {/* Navbar */}
      <div className="mb-6 flex items-center justify-between px-6">
        <button 
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-sun-text transition-colors hover:bg-gray-50"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="text-sm font-semibold text-gray-500">March 22, 2025</span>
        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-sun-text">
          <Share2 size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="px-6">
        <h1 className="mb-3 text-3xl font-serif font-bold text-sun-text">Morning Reflection</h1>
        
        {/* Tags */}
        <div className="mb-6 flex gap-2">
            {['Personal', 'Calm', 'Motivation'].map(tag => (
                <span key={tag} className="rounded-full bg-sun-surface px-3 py-1.5 text-xs font-bold text-sun-subtext">
                    {tag}
                </span>
            ))}
        </div>

        {/* Photo Card */}
        <div className="relative mb-6 overflow-hidden rounded-3xl shadow-sm">
            <img 
                src="https://picsum.photos/seed/morning/800/600" 
                alt="Morning" 
                className="h-80 w-full object-cover"
            />
            <div className="absolute bottom-4 right-4 rounded-full bg-black/30 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                Los Angeles, CA
            </div>
        </div>

        {/* Audio Player Card */}
        <div className="rounded-3xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-sun-text text-white transition-transform active:scale-95"
                >
                    {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                </button>
                
                {/* Mock Waveform */}
                <div className="flex h-10 flex-1 items-center gap-1">
                    {[...Array(20)].map((_, i) => {
                        const height = [40, 60, 30, 80, 50, 90, 40, 60, 30, 50, 70, 40, 60, 20, 50, 80, 40, 30, 50, 20][i];
                        return (
                            <div 
                                key={i} 
                                className={`w-1 rounded-full transition-all duration-300 ${i < 8 ? 'bg-sun-yellow' : 'bg-gray-200'}`}
                                style={{ height: `${isPlaying ? Math.random() * 80 + 20 : height}%` }}
                            ></div>
                        )
                    })}
                </div>

                <span className="text-xs font-bold text-gray-500">0:32</span>
            </div>
        </div>

        {/* Text Content Stub */}
        <div className="mt-8 space-y-4">
            <p className="text-lg leading-relaxed text-gray-600">
                Today I woke up feeling incredibly refreshed. The sun was shining through the window in a way that made everything look golden. I took a moment to just breathe and appreciate the quiet before the city woke up.
            </p>
            <p className="text-lg leading-relaxed text-gray-600">
                My intention for today is to stay present and not worry about the meetings scheduled for the afternoon. One step at a time.
            </p>
        </div>
      </div>
    </div>
  );
};