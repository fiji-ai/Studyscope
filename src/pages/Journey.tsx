import React, { useState } from 'react';
import { Map, Upload, Play, ArrowRight, CheckCircle2, XCircle, Loader2, FileText, Sparkles, Trophy, ChevronRight, Info } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface JourneyPart {
  title: string;
  summary: string;
  quiz: {
    question: string;
    options: string[];
    answer: string;
  };
}

const Journey: React.FC = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [loading, setLoading] = useState(false);
  const [journeyParts, setJourneyParts] = useState<JourneyPart[]>([]);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  
  // Quiz state
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [journeyComplete, setJourneyComplete] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSourceText(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const generateJourney = async () => {
    if (!sourceText.trim()) return;
    setLoading(true);
    setShowUploadModal(false);
    
    try {
      const prompt = `You are an expert tutor. Break the following source material into a step-by-step learning journey.
Divide the text into 3 to 5 logical parts.
For each part, provide:
1. A catchy 'title'
2. A concise 'summary' of the key points
3. A multiple-choice 'quiz' question to test understanding of this part, with 4 'options' and the exact correct 'answer' (which must match one of the options).

Return ONLY a valid JSON array of objects matching this structure:
[
  {
    "title": "string",
    "summary": "string",
    "quiz": {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "answer": "string"
    }
  }
]

Source material:
${sourceText}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      let responseText = response.text || '[]';
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsedParts = JSON.parse(responseText) as JourneyPart[];
      setJourneyParts(parsedParts);
      setCurrentPartIndex(0);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setJourneyComplete(false);
    } catch (error) {
      console.error("Failed to generate journey:", error);
      alert("Failed to generate the journey. Please try again with different text.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (option: string) => {
    if (isCorrect) return; 
    setSelectedAnswer(option);
    const correct = option === journeyParts[currentPartIndex].quiz.answer;
    setIsCorrect(correct);
  };

  const handleNextPart = () => {
    if (currentPartIndex < journeyParts.length - 1) {
      setCurrentPartIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      setJourneyComplete(true);
    }
  };

  const resetJourney = () => {
    setJourneyParts([]);
    setSourceText('');
    setJourneyComplete(false);
    setCurrentPartIndex(0);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-brand-600 animate-spin mb-6" />
          <Sparkles className="w-6 h-6 text-brand-400 absolute -top-2 -right-2 animate-pulse" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 font-display tracking-tight">Crafting your Journey...</h2>
        <p className="text-gray-500 mt-2 font-medium">Breaking down your sources into a guided adventure.</p>
      </div>
    );
  }

  if (journeyComplete) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto text-center py-16 bg-white rounded-3xl shadow-2xl shadow-brand-100 border border-brand-50 p-12 mt-10 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-400 via-brand-600 to-brand-400"></div>
        <div className="bg-brand-100 p-8 rounded-3xl inline-block mb-8 shadow-inner">
          <Trophy className="w-20 h-20 text-brand-600" />
        </div>
        <h1 className="text-5xl font-black text-gray-900 mb-4 font-display tracking-tight">Journey Complete!</h1>
        <p className="text-xl text-gray-600 mb-12 font-medium">Incredible work! You've successfully mastered this material.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={resetJourney}
            className="w-full sm:w-auto px-10 py-4 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 transition-all shadow-xl shadow-brand-200 hover:-translate-y-1"
          >
            Start a New Journey
          </button>
          <button className="w-full sm:w-auto px-10 py-4 bg-white text-brand-600 font-black rounded-2xl border-2 border-brand-100 hover:bg-brand-50 transition-all">
            Share Achievement
          </button>
        </div>
      </motion.div>
    );
  }

  if (journeyParts.length > 0) {
    const currentPart = journeyParts[currentPartIndex];
    const progress = ((currentPartIndex) / journeyParts.length) * 100;

    return (
      <div className="max-w-6xl mx-auto space-y-8 px-4 md:px-0">
        {/* Progress Bar */}
        <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-100 border border-gray-50 relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Map className="w-5 h-5 text-brand-600" />
              <span className="text-sm font-black text-gray-900 font-display tracking-tight uppercase tracking-widest">Your Adventure</span>
            </div>
            <span className="text-xs font-black text-brand-600 bg-brand-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Part {currentPartIndex + 1} of {journeyParts.length}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="bg-gradient-to-r from-brand-400 to-brand-600 h-full rounded-full shadow-lg shadow-brand-200"
            ></motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Summary */}
          <motion.div 
            key={`summary-${currentPartIndex}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-50 p-8 sm:p-10 relative"
          >
            <div className="absolute -top-4 -left-4 bg-brand-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-brand-200 font-display">
              {currentPartIndex + 1}
            </div>
            <h2 className="text-xs font-black text-brand-600 uppercase tracking-[0.2em] mb-3 ml-8">Chapter {currentPartIndex + 1}</h2>
            <h1 className="text-4xl font-black text-gray-900 mb-8 font-display tracking-tight leading-tight">{currentPart.title}</h1>
            <div className="prose prose-brand max-w-none prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-lg prose-headings:font-display">
              <ReactMarkdown>{currentPart.summary}</ReactMarkdown>
            </div>
          </motion.div>

          {/* Right Column: Game/Quiz */}
          <motion.div 
            key={`quiz-${currentPartIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-brand-50/50 rounded-3xl shadow-xl shadow-brand-50 border border-brand-100 p-8 sm:p-10 flex flex-col relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-32 h-32 text-brand-600" />
            </div>
            
            <h3 className="text-2xl font-black text-brand-900 mb-8 flex items-center font-display tracking-tight">
              <Play className="w-6 h-6 mr-3 text-brand-600" /> Knowledge Check
            </h3>
            
            <p className="text-xl font-bold text-gray-800 mb-8 leading-relaxed">{currentPart.quiz.question}</p>
            
            <div className="space-y-4 flex-1">
              {currentPart.quiz.options.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isCorrectOption = option === currentPart.quiz.answer;
                
                let btnClass = "w-full text-left p-5 rounded-2xl border-2 transition-all font-bold text-base relative overflow-hidden group ";
                
                if (selectedAnswer) {
                  if (isCorrectOption) {
                    btnClass += "bg-green-50 border-green-500 text-green-800 shadow-lg shadow-green-100";
                  } else if (isSelected && !isCorrectOption) {
                    btnClass += "bg-red-50 border-red-500 text-red-800 shadow-lg shadow-red-100";
                  } else {
                    btnClass += "bg-white border-gray-100 text-gray-400 opacity-50";
                  }
                } else {
                  btnClass += "bg-white border-white hover:border-brand-200 text-gray-700 hover:bg-brand-50 hover:shadow-xl hover:shadow-brand-100 hover:-translate-y-0.5";
                }

                return (
                  <motion.button
                    key={idx}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={isCorrect === true}
                    className={btnClass}
                  >
                    <div className="flex justify-between items-center relative z-10">
                      <span className="flex-1 pr-4">{option}</span>
                      <div className="flex-shrink-0">
                        {selectedAnswer && isCorrectOption && <CheckCircle2 className="w-6 h-6 text-green-600" />}
                        {isSelected && !isCorrectOption && <XCircle className="w-6 h-6 text-red-600" />}
                        {!selectedAnswer && <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {isCorrect === true && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-10"
                >
                  <button
                    onClick={handleNextPart}
                    className="w-full flex items-center justify-center px-8 py-5 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 transition-all shadow-2xl shadow-brand-200 hover:-translate-y-1 group"
                  >
                    {currentPartIndex < journeyParts.length - 1 ? 'Continue Journey' : 'Complete Journey'} 
                    <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-4 md:px-0">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[3rem] shadow-2xl shadow-gray-100 border border-gray-50 p-8 sm:p-16 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-50 rounded-full -ml-24 -mb-24 opacity-50"></div>
        
        <div className="relative z-10">
          <div className="bg-brand-100 p-6 rounded-3xl inline-block mb-8 shadow-inner">
            <Map className="w-16 h-16 text-brand-600" />
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-6 font-display tracking-tight leading-tight">Start a New Journey</h1>
          <p className="text-gray-500 text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            Upload your study materials, and we'll break it down into an interactive, step-by-step adventure with summaries and mini-games.
          </p>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-10 py-5 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 transition-all shadow-2xl shadow-brand-200 hover:-translate-y-1 group"
          >
            <Upload className="w-6 h-6 mr-3 group-hover:-translate-y-1 transition-transform" /> Upload Sources
          </button>
        </div>
      </motion.div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-950/40 backdrop-blur-sm"
              onClick={() => setShowUploadModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full p-8 sm:p-12 relative z-10 overflow-hidden"
            >
              <button 
                onClick={() => setShowUploadModal(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <XCircle className="w-7 h-7" />
              </button>
              
              <h2 className="text-3xl font-black text-gray-900 mb-3 font-display tracking-tight">Upload Your Sources</h2>
              <p className="text-gray-500 mb-10 font-medium">Paste your text or upload a document to begin your adventure.</p>
              
              <div className="space-y-6">
                <div className="group border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center hover:bg-brand-50 hover:border-brand-300 transition-all relative">
                  <input 
                    type="file" 
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="bg-gray-50 p-4 rounded-2xl inline-block mb-4 group-hover:bg-white transition-colors">
                    <FileText className="w-10 h-10 text-brand-400 group-hover:text-brand-600 transition-colors" />
                  </div>
                  <p className="text-lg font-black text-gray-900 font-display">Click to upload a .txt file</p>
                  <p className="text-sm text-gray-500 mt-1 font-medium">or drag and drop here</p>
                </div>

                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-gray-100"></div>
                  <span className="flex-shrink-0 mx-6 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">OR PASTE TEXT</span>
                  <div className="flex-grow border-t border-gray-100"></div>
                </div>

                <textarea
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="Paste your chapter, article, or notes here..."
                  className="w-full h-48 p-6 border border-gray-100 rounded-3xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 bg-gray-50 transition-all text-gray-700 font-medium resize-none scrollbar-hide"
                />
              </div>

              <div className="mt-10 flex flex-col sm:flex-row justify-end gap-4">
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="px-8 py-4 text-gray-500 font-black rounded-2xl hover:bg-gray-100 transition-all uppercase tracking-wider text-xs"
                >
                  Cancel
                </button>
                <button 
                  onClick={generateJourney}
                  disabled={!sourceText.trim()}
                  className="px-10 py-4 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 disabled:opacity-50 transition-all shadow-xl shadow-brand-200 flex items-center justify-center group"
                >
                  Start Journey <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Journey;
