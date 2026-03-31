import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, LayoutDashboard, BrainCircuit, Library, Settings, Crown, Map, X, Sparkles, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'A Journey', path: '/journey', icon: Map },
    { name: 'Subject Notes', path: '/notes', icon: BookOpen },
    { name: 'AI Summaries', path: '/ai-summaries', icon: BrainCircuit },
    { name: 'Flashcards', path: '/flashcards', icon: Library },
    { name: 'AI Tutor', path: '/tutor', icon: BrainCircuit },
    { name: 'Quizzes', path: '/quizzes', icon: BookOpen },
    { name: 'Games', path: '/games', icon: LayoutDashboard },
    { name: 'Practice Tests', path: '/tests', icon: Library },
    { name: 'About Us', path: '/about', icon: Info },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-950/40 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 flex flex-col h-full transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo className="w-10 h-10" />
            <span className="text-2xl font-black text-gray-900 font-display tracking-tight">StudyScope</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 md:hidden bg-gray-50 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-6 space-y-8 overflow-y-auto py-4">
          <div>
            <p className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
              Main Menu
            </p>
            <div className="space-y-1.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-100 translate-x-1'
                        : 'text-gray-500 hover:bg-brand-50 hover:text-brand-600'
                    }`
                  }
                >
                  <item.icon className={`w-5 h-5 mr-3 flex-shrink-0 transition-transform group-hover:scale-110`} />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>

          {user?.role === 'owner' && (
            <div>
              <p className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center">
                Admin Area
                <Crown className="w-3 h-3 ml-2 text-amber-500" />
              </p>
              <NavLink
                to="/admin"
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-100 translate-x-1'
                      : 'text-gray-500 hover:bg-amber-50 hover:text-amber-600'
                  }`
                }
              >
                <Settings className="w-5 h-5 mr-3 flex-shrink-0 transition-transform group-hover:rotate-45" />
                Site Customization
              </NavLink>
            </div>
          )}
        </nav>

        <div className="p-6 border-t border-gray-50">
          <div className="bg-gray-50 rounded-2xl p-4 mb-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-black text-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.grade}</p>
              </div>
            </div>
            <NavLink
              to="/profile"
              onClick={() => onClose()}
              className={({ isActive }) =>
                `flex items-center justify-center w-full py-2.5 text-xs font-bold rounded-xl transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`
              }
            >
              <Settings className="w-4 h-4 mr-2" />
              Profile Settings
            </NavLink>
          </div>
          
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
