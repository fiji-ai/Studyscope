import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer, Coffee, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const StudyTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'study' | 'break'>('study');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play a sound or notify the user
      if (mode === 'study') {
        alert('Time for a break!');
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        alert('Break over! Back to studying.');
        setMode('study');
        setTimeLeft(25 * 60);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'study' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'study' 
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100 
    : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-100 p-8 relative overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-gray-900 flex items-center font-display tracking-tight">
          <div className={`p-2 rounded-lg mr-4 ${mode === 'study' ? 'bg-brand-100 text-brand-600' : 'bg-green-100 text-green-600'}`}>
            {mode === 'study' ? <Timer className="w-6 h-6" /> : <Coffee className="w-6 h-6" />}
          </div>
          {mode === 'study' ? 'Focus Session' : 'Short Break'}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setMode('study');
              setTimeLeft(25 * 60);
              setIsActive(false);
            }}
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${mode === 'study' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
          >
            Study
          </button>
          <button 
            onClick={() => {
              setMode('break');
              setTimeLeft(5 * 60);
              setIsActive(false);
            }}
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${mode === 'break' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
          >
            Break
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-4">
        <div className="relative w-48 h-48 flex items-center justify-center mb-8">
          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-100"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray="553"
              animate={{ strokeDashoffset: 553 - (553 * progress) / 100 }}
              transition={{ duration: 1, ease: "linear" }}
              className={mode === 'study' ? 'text-brand-600' : 'text-green-600'}
            />
          </svg>
          
          <div className="text-center relative z-10">
            <span className="text-5xl font-black text-gray-900 font-display tabular-nums">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTimer}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all active:scale-95 ${
              isActive 
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                : mode === 'study' 
                  ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-200' 
                  : 'bg-green-600 text-white hover:bg-green-700 shadow-green-200'
            }`}
          >
            {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>
          <button
            onClick={resetTimer}
            className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-gray-100 transition-all active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
        <div className="flex items-center text-gray-400">
          <Zap className="w-4 h-4 mr-2" />
          <span className="text-xs font-bold uppercase tracking-widest">Focus Level</span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div 
              key={i} 
              className={`w-2 h-2 rounded-full ${i <= 3 ? (mode === 'study' ? 'bg-brand-500' : 'bg-green-500') : 'bg-gray-200'}`} 
            />
          ))}
        </div>
      </div>

      {/* Background Glow */}
      <div className={`absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${mode === 'study' ? 'bg-brand-400' : 'bg-green-400'}`} />
    </div>
  );
};

export default StudyTimer;
