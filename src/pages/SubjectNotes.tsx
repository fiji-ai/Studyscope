import React, { useState, useEffect } from 'react';
import { Book, Plus, Trash2, Save, Search, ChevronLeft, FileText, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SubjectNotes: React.FC = () => {
  const [notes, setNotes] = useState([
    { id: 1, title: 'Biology: Cell Structure', content: 'Cells are the basic building blocks of all living things. They provide structure for the body, take in nutrients from food, convert those nutrients into energy, and carry out specialized functions.' },
    { id: 2, title: 'Physics: Motion', content: 'Motion is the change in position of an object over time. It is described in terms of displacement, distance, velocity, acceleration, speed, and time.' }
  ]);
  const [activeId, setActiveId] = useState<number>(1);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileEditor, setShowMobileEditor] = useState(false);

  const activeNote = notes.find(n => n.id === activeId);

  useEffect(() => {
    if (activeNote) {
      setEditTitle(activeNote.title);
      setEditContent(activeNote.content);
    }
  }, [activeId, activeNote]);

  const handleSave = () => {
    setNotes(notes.map(n => n.id === activeId ? { ...n, title: editTitle, content: editContent } : n));
  };

  const handleAdd = () => {
    const newNote = { id: Date.now(), title: 'Untitled Note', content: '' };
    setNotes([newNote, ...notes]);
    setActiveId(newNote.id);
    setShowMobileEditor(true);
  };

  const handleDelete = (id: number) => {
    const newNotes = notes.filter(n => n.id !== id);
    setNotes(newNotes);
    if (activeId === id && newNotes.length > 0) {
      setActiveId(newNotes[0].id);
    } else if (newNotes.length === 0) {
      setActiveId(0);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-10rem)] bg-white/50 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
      {/* Sidebar */}
      <motion.div 
        initial={false}
        animate={{ width: showMobileEditor ? '0%' : '100%' }}
        className={`md:w-80 border-r border-brand-100 flex flex-col bg-brand-50/30 overflow-hidden ${showMobileEditor ? 'hidden md:flex' : 'flex'}`}
      >
        <div className="p-6 border-b border-brand-100 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-display font-bold text-brand-900 text-xl flex items-center">
              <Book className="w-6 h-6 mr-2 text-brand-600"/> My Notes
            </h2>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAdd} 
              className="p-2 bg-brand-600 text-white rounded-xl shadow-lg shadow-brand-200 hover:bg-brand-700 transition-colors"
            >
              <Plus className="w-5 h-5"/>
            </motion.button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
            <input 
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-brand-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {filteredNotes.map(n => (
              <motion.div 
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={n.id} 
                onClick={() => { setActiveId(n.id); setShowMobileEditor(true); }} 
                className={`p-4 rounded-2xl cursor-pointer flex justify-between items-center transition-all duration-300 group ${
                  activeId === n.id 
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-200' 
                    : 'bg-white border border-brand-100 hover:border-brand-300 text-brand-900 hover:shadow-md'
                }`}
              >
                <div className="flex items-center min-w-0">
                  <FileText className={`w-4 h-4 mr-3 flex-shrink-0 ${activeId === n.id ? 'text-brand-100' : 'text-brand-400'}`} />
                  <span className="font-medium truncate pr-2">{n.title}</span>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.2, color: '#ef4444' }}
                  onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }} 
                  className={`p-1 transition-colors ${activeId === n.id ? 'text-brand-200 hover:text-white' : 'text-brand-300 hover:text-red-500'}`}
                >
                  <Trash2 className="w-4 h-4"/>
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredNotes.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10 space-y-3"
            >
              <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-6 h-6 text-brand-400" />
              </div>
              <p className="text-brand-500 text-sm">No notes found matching your search.</p>
            </motion.div>
          )}
        </div>
      </motion.div>
      
      {/* Editor */}
      <div className={`flex-1 flex flex-col bg-white/80 ${!showMobileEditor ? 'hidden md:flex' : 'flex'}`}>
        <AnimatePresence mode="wait">
          {activeNote ? (
            <motion.div 
              key={activeId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col"
            >
              <div className="p-6 border-b border-brand-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/50 backdrop-blur-md gap-4">
                <div className="flex items-center w-full">
                  <motion.button 
                    whileHover={{ x: -2 }}
                    onClick={() => setShowMobileEditor(false)}
                    className="mr-4 p-2 text-brand-400 hover:text-brand-600 md:hidden bg-brand-50 rounded-xl"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </motion.button>
                  <input 
                    value={editTitle} 
                    onChange={e => setEditTitle(e.target.value)} 
                    className="text-2xl font-display font-bold focus:outline-none w-full text-brand-900 placeholder-brand-200 bg-transparent" 
                    placeholder="Note Title"
                  />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave} 
                    className="flex-1 sm:flex-none flex items-center justify-center px-6 py-2.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-200"
                  >
                    <Save className="w-4 h-4 mr-2"/> Save Changes
                  </motion.button>
                </div>
              </div>
              <textarea 
                value={editContent} 
                onChange={e => setEditContent(e.target.value)} 
                className="flex-1 p-8 sm:p-10 resize-none focus:outline-none text-brand-800 leading-relaxed text-lg bg-transparent placeholder-brand-200 font-sans" 
                placeholder="Start typing your thoughts here..." 
              />
              <div className="p-4 border-t border-brand-50 bg-brand-50/30 flex justify-between items-center text-xs text-brand-400 font-mono">
                <div className="flex items-center gap-4">
                  <span>{editContent.length} characters</span>
                  <span>{editContent.split(/\s+/).filter(Boolean).length} words</span>
                </div>
                <div className="flex items-center gap-1 text-brand-600 font-medium">
                  <Sparkles className="w-3 h-3" />
                  AI Sync Active
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-brand-300 p-10 text-center space-y-6"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-brand-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <Book className="w-24 h-24 relative text-brand-200" />
              </div>
              <div className="space-y-2 max-w-xs">
                <h3 className="text-xl font-display font-bold text-brand-900">Your Knowledge Hub</h3>
                <p className="text-brand-500">Select a note from the sidebar or click the plus button to start a new chapter in your learning journey.</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAdd}
                className="px-6 py-3 bg-brand-100 text-brand-600 rounded-2xl font-bold hover:bg-brand-200 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> Create First Note
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SubjectNotes;
