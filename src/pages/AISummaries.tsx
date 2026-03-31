import React, { useState } from 'react';
import { BrainCircuit, Sparkles, Loader2, Copy, Check, Trash2, FileText } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

const AISummaries: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSummarize = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setSummary('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Please provide a concise, educational summary of the following text, highlighting the key points in markdown format with clear headings and bullet points:\n\n${inputText}`
      });
      setSummary(response.text || 'Could not generate summary.');
    } catch (error) {
      console.error(error);
      setSummary('An error occurred while generating the summary. Please check your API key or try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInputText('');
    setSummary('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 max-w-2xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 text-brand-600 rounded-full font-bold text-sm uppercase tracking-wider">
          <BrainCircuit className="w-4 h-4" />
          <span>AI Intelligence</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-black text-brand-900 leading-tight">
          Smart Summarizer
        </h1>
        <p className="text-brand-500 text-lg font-medium">
          Transform complex chapters and long articles into clear, actionable study notes in seconds.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-[2.5rem] shadow-2xl shadow-brand-100/50 border border-brand-100 p-8 space-y-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-brand-100 to-transparent rounded-full blur-3xl -mr-20 -mt-20 opacity-60" />
          
          <div className="flex justify-between items-center relative z-10">
            <h3 className="text-xl font-display font-black text-brand-900 flex items-center gap-3">
              <div className="p-2 bg-brand-100 rounded-xl">
                <FileText className="w-5 h-5 text-brand-600" />
              </div>
              Source Material
            </h3>
            <button 
              onClick={clearAll}
              className="text-brand-300 hover:text-red-500 transition-all p-2 hover:bg-red-50 rounded-xl active:scale-90"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your textbook chapter, article, or long notes here..."
            className="w-full h-80 p-6 bg-brand-50/30 border-2 border-brand-100 rounded-3xl focus:outline-none focus:border-brand-500 transition-all resize-none text-brand-900 placeholder-brand-200 font-sans leading-relaxed text-sm font-medium"
          />
          
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSummarize}
            disabled={loading || !inputText.trim()}
            className="w-full flex items-center justify-center gap-3 py-4.5 bg-gradient-to-r from-brand-600 to-brand-900 text-white font-black text-lg rounded-2xl shadow-xl shadow-brand-200 transition-all disabled:opacity-50 disabled:from-brand-300 disabled:to-brand-400"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
            {loading ? 'Analyzing Content...' : 'Generate AI Summary'}
          </motion.button>
        </motion.div>

        {/* Output Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="min-h-[500px] flex flex-col"
        >
          <AnimatePresence mode="wait">
            {summary ? (
              <motion.div 
                key="summary"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[2.5rem] shadow-2xl shadow-brand-100/50 border border-brand-100 p-8 sm:p-10 text-brand-900 relative overflow-hidden flex-1 flex flex-col"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-brand-100 to-transparent rounded-full blur-3xl -mr-32 -mt-32 opacity-40" />
                
                <div className="flex justify-between items-center mb-8 relative z-10">
                  <h3 className="text-xl font-display font-black flex items-center gap-3">
                    <div className="p-2 bg-brand-600 rounded-xl">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    AI Insights
                  </h3>
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-600 rounded-xl transition-all font-bold text-sm border border-brand-100"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy Notes'}
                  </button>
                </div>

                <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-2">
                  <div className="prose prose-brand max-w-none prose-headings:font-display prose-headings:font-black prose-p:text-brand-700 prose-p:leading-relaxed prose-li:text-brand-700">
                    <ReactMarkdown>{summary}</ReactMarkdown>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-brand-100 text-[10px] text-brand-400 font-mono uppercase tracking-widest flex justify-between items-center">
                  <span>Generated by StudyScope AI</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    High Precision Mode
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-white border-2 border-dashed border-brand-200 rounded-[2.5rem] space-y-6 shadow-inner"
              >
                <div className="w-24 h-24 bg-brand-50 rounded-[2rem] flex items-center justify-center shadow-sm">
                  <BrainCircuit className="w-12 h-12 text-brand-300" />
                </div>
                <div className="space-y-3">
                  <h4 className="text-2xl font-display font-black text-brand-900">Ready to Analyze</h4>
                  <p className="text-brand-500 max-w-xs mx-auto font-medium">Paste your content on the left to see the magic happen here.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default AISummaries;
