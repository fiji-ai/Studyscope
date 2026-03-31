import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, User, LogOut, Crown, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-20 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
      <div className="flex items-center flex-1">
        <button 
          onClick={onMenuClick}
          className="p-2.5 mr-4 text-gray-500 hover:bg-gray-50 rounded-xl md:hidden border border-gray-100 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="md:hidden flex items-center gap-2 mr-4">
          <Logo className="w-8 h-8" />
        </div>

        <div className="relative w-full max-w-md hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-2.5 border border-gray-100 rounded-2xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 sm:text-sm transition-all"
            placeholder="Search notes, flashcards, or ask AI..."
          />
        </div>
      </div>

      <div className="flex items-center space-x-3 md:space-x-6">
        <button className="p-2.5 text-gray-400 hover:text-brand-600 rounded-xl hover:bg-brand-50 transition-all border border-transparent hover:border-brand-100 hidden xs:block">
          <Bell className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3 md:space-x-4 border-l border-gray-100 pl-4 md:pl-6">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-black text-gray-900 truncate max-w-[100px] md:max-w-none font-display">{user?.name}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{user?.grade} • {user?.board}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-black shadow-lg shadow-brand-200">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={handleLogout}
            className="p-2.5 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
