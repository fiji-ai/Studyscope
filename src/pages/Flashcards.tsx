import React, { useState } from 'react';
import { Library, ArrowRight, ArrowLeft, RotateCw, Sparkles, Trophy, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from '@google/genai';

interface Card {
  front: string;
  back: string;
}

interface Deck {
  title: string;
  cards: Card[];
}

const Flashcards: React.FC = () => {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);
  
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [deck, setDeck] = useState<Deck | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create 5 educational flashcards about the topic: "${topic}".`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                front: { type: Type.STRING, description: "The question or concept" },
                back: { type: Type.STRING, description: "The answer or explanation" }
              },
              required: ["front", "back"]
            }
          }
        }
      });
      
      const cards = JSON.parse(response.text || '[]');
      setDeck({ title: topic, cards });
      setCurrentCard(0);
      setIsFlipped(false);
    } catch (error) {
      console.error("Error generating flashcards:", error);
      alert("Failed to generate flashcards. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    if (!deck) return;
    setDirection(1);
    setIsFlipped(false);
    setCurrentCard((prev) => (prev + 1) % deck.cards.length);
  };

  const handlePrev = () => {
    if (!deck) return;
    setDirection(-1);
    setIsFlipped(false);
    setCurrentCard((prev) => (prev - 1 + deck.cards.length) % deck.cards.length);
  };

  if (!deck) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-xl border border-brand-100 p-8 md:p-12 text-center"
        >
          <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-brand-600" />
          </div>
          <h1 className="text-3xl font-display font-black text-brand-900 mb-4">What do you want to study?</h1>
          <p className="text-brand-500 font-medium mb-8">Enter a topic, and our AI will generate a custom deck of flashcards for you instantly.</p>
          
          <form onSubmit={handleGenerate} className="space-y-4">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Quantum Physics, French Verbs, World War II..."
              className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 outline-none transition-all text-lg font-medium"
              disabled={isGenerating}
            />
            <button
              type="submit"
              disabled={!topic.trim() || isGenerating}
              className="w-full py-4 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-brand-200"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Generating Deck...
                </>
              ) : (
                'Generate Flashcards'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const progress = ((currentCard + 1) / deck.cards.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-brand-600 font-bold text-sm uppercase tracking-wider">
              <Library className="w-4 h-4" />
              <span>Study Deck</span>
            </div>
            <h1 className="text-4xl font-display font-black text-brand-900 leading-tight">
              {deck.title}
            </h1>
            <p className="text-brand-500 font-medium">Master these concepts with interactive active recall.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-brand-100">
            <div className="text-right">
              <div className="text-xs font-bold text-brand-400 uppercase">Progress</div>
              <div className="text-xl font-display font-bold text-brand-900">{currentCard + 1} / {deck.cards.length}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
              <Trophy className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-brand-100 rounded-full overflow-hidden shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-brand-500 to-brand-600 shadow-lg shadow-brand-200"
          />
        </div>

        {/* Flashcard Area */}
        <div className="relative h-[450px] perspective-1000">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentCard}
              custom={direction}
              initial={{ opacity: 0, x: direction * 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -direction * 100, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="w-full h-full cursor-pointer"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                className="w-full h-full relative"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front Side */}
                <div 
                  className="absolute inset-0 bg-white rounded-[2.5rem] shadow-2xl border-2 border-brand-100 flex flex-col items-center justify-center p-12 text-center group overflow-hidden"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="absolute top-0 left-0 w-full h-2 bg-brand-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                  <Sparkles className="w-12 h-12 text-brand-200 mb-8 animate-pulse" />
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-900 leading-tight">
                    {deck.cards[currentCard].front}
                  </h2>
                  <div className="mt-12 flex items-center gap-2 text-brand-400 font-bold text-sm uppercase tracking-widest group-hover:text-brand-600 transition-colors">
                    <RotateCw className="w-4 h-4" />
                    Click to reveal answer
                  </div>
                  
                  {/* Decorative blobs */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-50 rounded-full blur-3xl opacity-50" />
                  <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-brand-100 rounded-full blur-3xl opacity-50" />
                </div>

                {/* Back Side */}
                <div 
                  className="absolute inset-0 bg-brand-600 rounded-[2.5rem] shadow-2xl border-2 border-brand-500 flex flex-col items-center justify-center p-12 text-center text-white overflow-hidden"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <div className="absolute top-0 left-0 w-full h-2 bg-white/20" />
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-8">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-display font-bold leading-tight">
                    {deck.cards[currentCard].back}
                  </h2>
                  <div className="mt-12 flex items-center gap-2 text-white/60 font-bold text-sm uppercase tracking-widest">
                    <RotateCw className="w-4 h-4" />
                    Click to see question
                  </div>

                  {/* Decorative blobs */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                  <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-brand-400 rounded-full blur-3xl opacity-20" />
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center gap-8">
          <motion.button 
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePrev} 
            className="p-5 rounded-2xl bg-white border-2 border-brand-100 text-brand-600 hover:bg-brand-50 transition-all shadow-lg shadow-brand-100"
          >
            <ArrowLeft className="w-8 h-8"/>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFlipped(!isFlipped)} 
            className="flex items-center gap-3 px-10 py-4 bg-brand-900 text-white font-black text-lg rounded-2xl shadow-xl shadow-brand-200 hover:bg-black transition-all uppercase tracking-tight"
          >
            <RotateCw className="w-6 h-6"/> Flip
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.1, x: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNext} 
            className="p-5 rounded-2xl bg-brand-600 text-white hover:bg-brand-700 transition-all shadow-lg shadow-brand-200"
          >
            <ArrowRight className="w-8 h-8"/>
          </motion.button>
        </div>

        {/* Tips Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-brand-50/50 border border-brand-100 rounded-3xl p-6 flex items-start gap-4"
        >
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
            <Sparkles className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h4 className="font-bold text-brand-900">Pro Tip!</h4>
            <p className="text-brand-600 text-sm">Use active recall by trying to say the answer out loud before flipping the card. It strengthens memory connections!</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Flashcards;
