import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, PlayCircle, BookOpen, Video, Sparkles, ChevronRight, Info, X } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

interface IPrepVideo {
  id: string;
  title: string;
  subject: string;
  thumbnail: string;
  url: string;
  keywords: string[];
}

const I_PREP_VIDEOS: IPrepVideo[] = [
  {
    id: 'v1',
    title: 'Introduction to Algebra',
    subject: 'Math',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=300&h=200',
    url: 'https://www.youtube.com/embed/NybHckSEQBI',
    keywords: ['algebra', 'math', 'equation', 'variable', 'x']
  },
  {
    id: 'v2',
    title: 'Photosynthesis Explained',
    subject: 'Science',
    thumbnail: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=300&h=200',
    url: 'https://www.youtube.com/embed/sQK3Yr4Sc_k',
    keywords: ['photosynthesis', 'plant', 'biology', 'science', 'leaf', 'sunlight']
  },
  {
    id: 'v3',
    title: 'Newton\'s Laws of Motion',
    subject: 'Physics',
    thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=300&h=200',
    url: 'https://www.youtube.com/embed/kKKM8Y-u7ds',
    keywords: ['newton', 'physics', 'motion', 'force', 'gravity', 'science', 'inertia']
  },
  {
    id: 'v4',
    title: 'World War II Summary',
    subject: 'History',
    thumbnail: 'https://images.unsplash.com/photo-1552250575-e508473b090f?auto=format&fit=crop&q=80&w=300&h=200',
    url: 'https://www.youtube.com/embed/HUqy-OQvlnI',
    keywords: ['history', 'war', 'ww2', 'world war', 'allies', 'axis']
  },
  {
    id: 'v5',
    title: 'Basic English Grammar',
    subject: 'English',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=300&h=200',
    url: 'https://www.youtube.com/embed/avyVINB-zZY',
    keywords: ['english', 'grammar', 'noun', 'verb', 'sentence', 'language']
  }
];

const AITutor: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      content: `Hello ${user?.name || 'there'}! 👋 I'm your AI Tutor. What would you like to learn today? I can also recommend videos from our iPrep DigiClass library.`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedVideos, setRecommendedVideos] = useState<IPrepVideo[]>([]);
  const [activeVideo, setActiveVideo] = useState<IPrepVideo | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const updateRecommendations = (text: string) => {
    const lowerText = text.toLowerCase();
    const matches = I_PREP_VIDEOS.filter(video => 
      video.keywords.some(keyword => lowerText.includes(keyword))
    );
    
    if (matches.length > 0) {
      setRecommendedVideos(matches);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    updateRecommendations(userMessage);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: 'You are a helpful, encouraging, and knowledgeable AI tutor for a student. Explain concepts clearly, use examples, and keep responses concise but informative. If the user asks about a specific subject, give a brief overview and ask if they want to dive deeper.',
        }
      });

      const response = await chat.sendMessage({ message: userMessage });
      
      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response.text || 'I am sorry, I could not process that.'
      };
      
      setMessages(prev => [...prev, modelMsg]);
      updateRecommendations(response.text || '');
      
    } catch (error) {
      console.error('Error calling Gemini:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: 'Sorry, I encountered an error while trying to respond. Please try again.'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto px-4 md:px-0">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] shadow-2xl shadow-gray-100 border border-gray-100 overflow-hidden relative">
        <div className="p-6 sm:p-8 border-b border-gray-50 bg-gradient-to-r from-brand-50 to-white flex items-center justify-between relative z-10">
          <div className="flex items-center">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="bg-brand-600 p-4 rounded-2xl mr-5 shadow-xl shadow-brand-200"
            >
              <Bot className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h2 className="font-black text-gray-900 font-display tracking-tight text-2xl">AI Tutor</h2>
              <div className="flex items-center">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                <p className="text-[10px] text-brand-600 font-black uppercase tracking-[0.2em]">Online & Ready</p>
              </div>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="p-3 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-2xl transition-all"
          >
            <Info className="w-6 h-6" />
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 scrollbar-hide bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, idx) => (
              <motion.div 
                key={msg.id} 
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[90%] sm:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end group`}>
                  <motion.div 
                    whileHover={{ scale: 1.2 }}
                    className={`flex-shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg ${
                      msg.role === 'user' ? 'bg-brand-100 ml-4' : 'bg-white border border-gray-100 mr-4'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User className="w-7 h-7 text-brand-600" />
                    ) : (
                      <Bot className="w-7 h-7 text-gray-600" />
                    )}
                  </motion.div>
                  <div className={`p-5 sm:p-6 rounded-[2rem] shadow-xl ${
                    msg.role === 'user' 
                      ? 'bg-brand-600 text-white rounded-br-none shadow-brand-100' 
                      : 'bg-white text-gray-800 rounded-bl-none border border-gray-100 shadow-gray-100'
                  }`}>
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap font-bold text-sm sm:text-base leading-relaxed">{msg.content}</p>
                    ) : (
                      <div className="prose prose-sm sm:prose-base max-w-none prose-brand prose-p:leading-relaxed prose-p:text-gray-700 prose-headings:font-black prose-headings:font-display prose-headings:tracking-tight">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex flex-row max-w-[80%] items-end">
                <div className="flex-shrink-0 h-12 w-12 rounded-2xl bg-white border border-gray-100 mr-4 flex items-center justify-center shadow-md">
                  <Bot className="w-7 h-7 text-gray-600" />
                </div>
                <div className="p-6 rounded-[2rem] bg-white rounded-tl-none border border-gray-100 flex space-x-2 items-center shadow-xl shadow-gray-100">
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-2.5 h-2.5 bg-brand-500 rounded-full"
                  ></motion.div>
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                    className="w-2.5 h-2.5 bg-brand-500 rounded-full"
                  ></motion.div>
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                    className="w-2.5 h-2.5 bg-brand-500 rounded-full"
                  ></motion.div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 sm:p-8 border-t border-gray-50 bg-white relative z-10">
          <form onSubmit={handleSendMessage} className="flex space-x-4">
            <div className="flex-1 relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your studies..."
                className="w-full border-2 border-gray-100 rounded-[1.5rem] px-8 py-5 focus:outline-none focus:ring-8 focus:ring-brand-500/5 focus:border-brand-500 bg-gray-50/50 transition-all text-base font-bold placeholder:text-gray-400"
                disabled={isLoading}
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center space-x-3">
                <Sparkles className="w-5 h-5 text-brand-400 animate-pulse" />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-brand-600 text-white px-8 rounded-[1.5rem] hover:bg-brand-700 disabled:opacity-50 transition-all shadow-xl shadow-brand-200 flex items-center justify-center group"
            >
              <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </motion.button>
          </form>
          <p className="text-[10px] text-center text-gray-400 mt-6 font-black uppercase tracking-[0.3em]">
            AI can make mistakes. Verify important information.
          </p>
        </div>
        
        {/* Background Decorative Blob */}
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-50 rounded-full blur-3xl opacity-50 -z-10" />
      </div>

      {/* iPrep DigiClass Sidebar */}
      <div className="w-full lg:w-96 flex flex-col gap-8">
        <AnimatePresence>
          {activeVideo && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-100 border border-gray-100 overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-gray-50 bg-brand-50/50 flex justify-between items-center">
                <h3 className="font-black text-gray-900 flex items-center text-sm font-display tracking-tight">
                  <div className="bg-white p-1.5 rounded-lg mr-3 shadow-sm">
                    <Video className="w-4 h-4 text-red-500" />
                  </div>
                  Now Playing
                </h3>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setActiveVideo(null)}
                  className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-gray-600 transition-all shadow-sm"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
              <div className="aspect-video w-full bg-black relative group">
                <iframe 
                  src={activeVideo.url} 
                  title={activeVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="px-3 py-1 bg-brand-100 text-brand-700 text-[10px] font-black uppercase tracking-wider rounded-full">
                    {activeVideo.subject}
                  </span>
                </div>
                <h4 className="font-black text-gray-900 leading-tight font-display text-lg">{activeVideo.title}</h4>
                <div className="flex items-center mt-5 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                  <BookOpen className="w-3.5 h-3.5 mr-2 text-brand-400" />
                  iPrep DigiClass Library
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-100 border border-gray-100 overflow-hidden flex-1 flex flex-col">
          <div className="p-8 border-b border-gray-50 bg-gradient-to-br from-gray-50 to-white">
            <h3 className="font-black text-gray-900 flex items-center font-display tracking-tight text-xl">
              <div className="bg-brand-100 p-2 rounded-xl mr-4 shadow-sm">
                <Sparkles className="w-5 h-5 text-brand-500" />
              </div>
              Smart Recommendations
            </h3>
            <p className="text-xs text-gray-500 mt-3 font-bold leading-relaxed uppercase tracking-wider">
              {recommendedVideos.length > 0 
                ? "Matching your current topic!" 
                : "Explore our curated video library"}
            </p>
          </div>
          
          <div className="p-8 overflow-y-auto flex-1 space-y-6 scrollbar-hide">
            {(recommendedVideos.length > 0 ? recommendedVideos : I_PREP_VIDEOS).map((video, idx) => (
              <motion.div 
                key={video.id} 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="group cursor-pointer bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-brand-100 transition-all duration-300"
                onClick={() => setActiveVideo(video)}
              >
                <div className="relative h-44 w-full overflow-hidden">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-brand-900/0 group-hover:bg-brand-900/40 transition-all duration-300 flex items-center justify-center">
                    <motion.div 
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1.1 }}
                      className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <PlayCircle className="w-8 h-8 text-brand-600" />
                    </motion.div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-brand-700 text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg">
                      {video.subject}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="font-black text-sm text-gray-900 line-clamp-2 group-hover:text-brand-600 transition-colors font-display leading-snug">
                    {video.title}
                  </h4>
                  <div className="flex items-center mt-4 text-brand-600 font-black text-[10px] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    Watch Now <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITutor;
