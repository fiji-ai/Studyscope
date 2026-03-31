import React, { useState, useEffect } from 'react';
import { Gamepad2, Trophy, RefreshCw, Loader2, BookOpen, FileText, Timer, Star, Zap, ChevronRight, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';

interface GameQuestion {
  question: string;
  options: string[];
  answer: string;
}

const Games: React.FC = () => {
  const [showSetupModal, setShowSetupModal] = useState(true);
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const generateGame = async () => {
    if (!subject.trim() || !chapter.trim()) return;
    setLoading(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Create a 5-question fast-paced trivia game about the subject "${subject}", specifically focusing on the chapter/topic "${chapter}".
      Return ONLY a valid JSON array of objects matching this structure:
      [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "answer": "string"
        }
      ]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      let responseText = response.text || '[]';
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsedQuestions = JSON.parse(responseText) as GameQuestion[];
      
      parsedQuestions.forEach(q => {
        q.options = q.options.sort(() => Math.random() - 0.5);
      });

      setQuestions(parsedQuestions);
      setScore(0);
      setTimeLeft(60);
      setCurrentQIndex(0);
      setGameOver(false);
      setShowSetupModal(false);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } catch (error) {
      console.error("Failed to generate game:", error);
      alert("Failed to generate the game. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showSetupModal && timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showSetupModal && !gameOver) {
      setGameOver(true);
    }
  }, [timeLeft, gameOver, showSetupModal]);

  const handleAnswer = (opt: string) => {
    if (selectedAnswer) return;
    
    const currentQ = questions[currentQIndex];
    setSelectedAnswer(opt);
    const correct = opt === currentQ.answer;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 20);
    } else {
      setScore(Math.max(0, score - 5));
    }

    setTimeout(() => {
      if (currentQIndex < questions.length - 1) {
        setCurrentQIndex(currentQIndex + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setGameOver(true);
      }
    }, 1000);
  };

  const restart = () => {
    setShowSetupModal(true);
    setQuestions([]);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] relative overflow-hidden px-4 py-8">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-200/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-100/40 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-4xl mx-auto relative">
        <AnimatePresence mode="wait">
          {showSetupModal ? (
            <motion.div 
              key="setup"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="bg-white rounded-[3rem] shadow-2xl shadow-brand-100/50 border border-brand-100 p-8 md:p-12 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-100 to-transparent rounded-full blur-3xl -mr-32 -mt-32 opacity-60" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-brand-200 to-transparent rounded-full blur-3xl -ml-32 -mb-32 opacity-40" />
              
              <div className="relative z-10 max-w-md mx-auto space-y-8">
                <motion.div 
                  animate={{ rotate: [6, -6, 6] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-24 h-24 bg-gradient-to-br from-brand-600 to-brand-900 rounded-[2rem] shadow-xl shadow-brand-200 flex items-center justify-center mx-auto rotate-6"
                >
                  <Gamepad2 className="w-12 h-12 text-white" />
                </motion.div>
                
                <div className="space-y-3">
                  <h2 className="text-4xl md:text-5xl font-display font-black text-brand-900 tracking-tight">Speed Trivia</h2>
                  <p className="text-brand-500 font-medium text-lg leading-relaxed">Test your knowledge under pressure! Pick a topic to start the challenge.</p>
                </div>

                <div className="space-y-5 text-left">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-brand-900 uppercase tracking-[0.2em] ml-2">Subject</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <BookOpen className="w-5 h-5 text-brand-300 group-focus-within:text-brand-600 transition-colors" />
                      </div>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Biology, History"
                        className="w-full pl-12 pr-4 py-4.5 bg-brand-50/50 border-2 border-brand-100 rounded-2xl focus:outline-none focus:border-brand-500 transition-all font-bold text-brand-900 placeholder-brand-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-brand-900 uppercase tracking-[0.2em] ml-2">Chapter / Topic</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FileText className="w-5 h-5 text-brand-300 group-focus-within:text-brand-600 transition-colors" />
                      </div>
                      <input
                        type="text"
                        value={chapter}
                        onChange={(e) => setChapter(e.target.value)}
                        placeholder="e.g. Cell Structure"
                        className="w-full pl-12 pr-4 py-4.5 bg-brand-50/50 border-2 border-brand-100 rounded-2xl focus:outline-none focus:border-brand-500 transition-all font-bold text-brand-900 placeholder-brand-200"
                      />
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generateGame}
                  disabled={!subject.trim() || !chapter.trim() || loading}
                  className="w-full py-5 bg-gradient-to-r from-brand-600 to-brand-900 text-white font-black text-xl rounded-2xl shadow-xl shadow-brand-200 hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 fill-current" />}
                  {loading ? 'Generating...' : 'Start Challenge'}
                </motion.button>
              </div>
            </motion.div>
          ) : gameOver ? (
            <motion.div 
              key="gameover"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-brand-900 to-black rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-brand-900/40"
            >
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-10 left-10 rotate-12"><Star className="w-20 h-20" /></div>
                <div className="absolute bottom-10 right-10 -rotate-12"><Trophy className="w-20 h-20" /></div>
              </div>

              <div className="relative z-10 space-y-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto border border-white/20"
                >
                  <Trophy className="w-16 h-16 text-brand-400" />
                </motion.div>

                <div className="space-y-2">
                  <h2 className="text-5xl md:text-6xl font-display font-black tracking-tight">Victory!</h2>
                  <p className="text-brand-200 text-xl font-medium">You've completed the {subject} challenge.</p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-8 max-w-xs mx-auto border border-white/10">
                  <div className="text-xs font-black text-brand-300 uppercase tracking-[0.2em] mb-2">Final Score</div>
                  <div className="text-7xl font-display font-black text-white">{score}</div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={restart}
                  className="px-10 py-5 bg-white text-brand-900 font-black text-xl rounded-2xl shadow-2xl hover:bg-brand-50 transition-all flex items-center justify-center gap-3 mx-auto"
                >
                  <RefreshCw className="w-6 h-6" />
                  Play Again
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="gameplay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Game Header */}
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white px-6 py-3 rounded-2xl shadow-xl shadow-brand-50 border border-brand-100 flex items-center gap-3">
                    <Timer className={`w-6 h-6 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-brand-600'}`} />
                    <span className={`text-2xl font-display font-black ${timeLeft <= 10 ? 'text-red-500' : 'text-brand-900'}`}>{timeLeft}s</span>
                  </div>
                  <div className="bg-white px-6 py-3 rounded-2xl shadow-xl shadow-brand-50 border border-brand-100 flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-brand-400" />
                    <span className="text-2xl font-display font-black text-brand-900">{score}</span>
                  </div>
                </div>
                <div className="text-brand-400 font-black uppercase tracking-[0.2em] text-xs bg-white px-4 py-2 rounded-full border border-brand-50 shadow-sm">
                  Question {currentQIndex + 1} of {questions.length}
                </div>
              </div>

              {/* Question Card */}
              <motion.div 
                key={currentQIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-[3rem] shadow-2xl shadow-brand-100/50 border border-brand-100 p-8 md:p-12 space-y-10 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-40" />
                
                <h3 className="text-2xl md:text-4xl font-display font-black text-brand-900 leading-tight relative z-10">
                  {questions[currentQIndex].question}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
                  {questions[currentQIndex].options.map((opt, i) => {
                    const isSelected = selectedAnswer === opt;
                    const isCorrectAnswer = opt === questions[currentQIndex].answer;
                    
                    let buttonClass = "bg-brand-50/50 border-2 border-brand-100 text-brand-900 hover:border-brand-300 hover:bg-brand-100 shadow-sm";
                    if (isSelected) {
                      buttonClass = isCorrect ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-200" : "bg-red-500 border-red-500 text-white shadow-lg shadow-red-200";
                    } else if (selectedAnswer && isCorrectAnswer) {
                      buttonClass = "bg-green-500 border-green-500 text-white shadow-lg shadow-green-200";
                    }

                    return (
                      <motion.button
                        key={i}
                        whileHover={!selectedAnswer ? { scale: 1.02, y: -2 } : {}}
                        whileTap={!selectedAnswer ? { scale: 0.98 } : {}}
                        onClick={() => handleAnswer(opt)}
                        disabled={!!selectedAnswer}
                        className={`group relative p-6 text-left rounded-3xl font-black text-lg transition-all flex items-center gap-5 ${buttonClass}`}
                      >
                        <span className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-colors shadow-sm ${
                          isSelected || (selectedAnswer && isCorrectAnswer) 
                            ? 'bg-white/20 text-white' 
                            : 'bg-white text-brand-400 group-hover:text-brand-600'
                        }`}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="flex-1 leading-tight">{opt}</span>
                        {isSelected && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            {isCorrect ? <Star className="w-7 h-7 fill-current" /> : <AlertCircle className="w-7 h-7" />}
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-2">
                  <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Progress</span>
                  <span className="text-[10px] font-black text-brand-900 uppercase tracking-widest">{Math.round(((currentQIndex + 1) / questions.length) * 100)}%</span>
                </div>
                <div className="h-4 bg-brand-100 rounded-full overflow-hidden p-1 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
                    className="h-full bg-gradient-to-r from-brand-600 to-brand-900 rounded-full shadow-lg"
                  />
                </div>
              </div>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  </div>
);
};

export default Games;
