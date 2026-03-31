import React, { useState, useEffect } from 'react';
import { FileText, Play, Clock, HelpCircle, BarChart3, Sparkles, Loader2, CheckCircle, XCircle, Trophy, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from '@google/genai';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface TestData {
  topic: string;
  questions: Question[];
}

const PracticeTests: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [testData, setTestData] = useState<TestData | null>(null);
  
  // Test taking state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Stats state
  const [stats, setStats] = useState({ completed: 0, average: 0, hours: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      try {
        const q = query(collection(db, 'practiceTestResults'), where('userId', '==', user.id));
        const snapshot = await getDocs(q);
        let totalScore = 0;
        let totalQuestions = 0;
        let count = 0;

        snapshot.forEach(doc => {
          const data = doc.data();
          totalScore += data.score || 0;
          totalQuestions += data.totalQuestions || 0;
          count++;
        });

        const avg = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
        // Estimate 15 minutes per test
        const hours = Math.round((count * 15) / 60 * 10) / 10;

        setStats({ completed: count, average: avg, hours });
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'practiceTestResults');
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [user?.id, isFinished]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a 10-question multiple-choice practice test about: "${topic}".`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.INTEGER, description: "Index of correct option (0-3)" },
                explanation: { type: Type.STRING }
              },
              required: ["question", "options", "correctAnswer", "explanation"]
            }
          }
        }
      });
      
      const questions = JSON.parse(response.text || '[]');
      setTestData({ topic, questions });
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
      setScore(0);
      setIsFinished(false);
    } catch (error) {
      console.error("Error generating test:", error);
      alert("Failed to generate practice test. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSelect = (index: number) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(index);
  };

  const checkAnswer = () => {
    if (selectedAnswer === null || !testData) return;
    setIsAnswerChecked(true);
    if (selectedAnswer === testData.questions[currentQuestion].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const finishTest = async () => {
    setIsFinished(true);
    if (user?.id && testData) {
      try {
        await addDoc(collection(db, 'practiceTestResults'), {
          userId: user.id,
          topic: testData.topic,
          score: score,
          totalQuestions: testData.questions.length,
          date: new Date().toISOString()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'practiceTestResults');
      }
    }
  };

  const nextQuestion = () => {
    if (!testData) return;
    if (currentQuestion < testData.questions.length - 1) {
      setCurrentQuestion(c => c + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    } else {
      finishTest();
    }
  };

  const resetTest = () => {
    setTestData(null);
    setTopic('');
  };

  if (testData) {
    if (isFinished) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] shadow-xl border border-brand-100 p-8 md:p-12 text-center"
          >
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
            <h2 className="text-4xl font-display font-black text-brand-900 mb-4">Test Complete!</h2>
            <p className="text-xl text-brand-600 font-medium mb-8">
              You scored {score} out of {testData.questions.length} on "{testData.topic}"
            </p>
            <button
              onClick={resetTest}
              className="px-8 py-4 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-200"
            >
              Take Another Test
            </button>
          </motion.div>
        </div>
      );
    }

    const q = testData.questions[currentQuestion];

    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button 
          onClick={resetTest}
          className="flex items-center text-brand-500 hover:text-brand-700 font-bold mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Topics
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-brand-100 overflow-hidden">
          <div className="bg-brand-50 p-6 border-b border-brand-100 flex justify-between items-center">
            <span className="font-bold text-brand-800 uppercase tracking-wider text-sm">
              Question {currentQuestion + 1} of {testData.questions.length}
            </span>
            <span className="font-bold text-brand-600 bg-white px-4 py-1 rounded-full shadow-sm">
              Score: {score}
            </span>
          </div>
          
          <div className="p-8 md:p-10">
            <h3 className="text-2xl font-display font-bold text-brand-900 mb-8 leading-relaxed">
              {q.question}
            </h3>
            
            <div className="space-y-4">
              {q.options.map((option, index) => {
                let btnClass = "w-full text-left p-6 rounded-2xl border-2 transition-all font-medium text-lg ";
                
                if (!isAnswerChecked) {
                  btnClass += selectedAnswer === index 
                    ? "border-brand-500 bg-brand-50 text-brand-700" 
                    : "border-gray-100 hover:border-brand-200 hover:bg-gray-50 text-gray-700";
                } else {
                  if (index === q.correctAnswer) {
                    btnClass += "border-green-500 bg-green-50 text-green-800";
                  } else if (index === selectedAnswer) {
                    btnClass += "border-red-500 bg-red-50 text-red-800";
                  } else {
                    btnClass += "border-gray-100 opacity-50 text-gray-500";
                  }
                }
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={isAnswerChecked}
                    className={btnClass}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {isAnswerChecked && index === q.correctAnswer && (
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 ml-4" />
                      )}
                      {isAnswerChecked && index === selectedAnswer && index !== q.correctAnswer && (
                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 ml-4" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            
            <AnimatePresence>
              {isAnswerChecked && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`mt-8 p-6 rounded-2xl ${selectedAnswer === q.correctAnswer ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}
                >
                  <p className={`font-bold text-lg mb-2 ${selectedAnswer === q.correctAnswer ? 'text-green-800' : 'text-red-800'}`}>
                    {selectedAnswer === q.correctAnswer ? 'Excellent!' : 'Not quite.'}
                  </p>
                  <p className="text-gray-700 leading-relaxed">{q.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="mt-10 flex justify-end">
              {!isAnswerChecked ? (
                <button
                  onClick={checkAnswer}
                  disabled={selectedAnswer === null}
                  className="px-8 py-4 bg-brand-900 text-white font-black rounded-2xl hover:bg-black disabled:opacity-50 transition-all shadow-xl shadow-brand-200"
                >
                  Check Answer
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="px-8 py-4 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 transition-all shadow-xl shadow-brand-200 flex items-center"
                >
                  {currentQuestion < testData.questions.length - 1 ? 'Next Question' : 'Finish Test'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 max-w-2xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 text-brand-600 rounded-full font-bold text-sm uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Exam Readiness</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-black text-brand-900 leading-tight">
          Master Your Subjects
        </h1>
        <p className="text-brand-500 text-lg font-medium">
          Take full-length mock tests designed to simulate real exam conditions and boost your confidence.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto bg-white rounded-[2.5rem] shadow-xl border border-brand-100 p-8 md:p-12 text-center"
      >
        <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="w-10 h-10 text-brand-600" />
        </div>
        <h2 className="text-3xl font-display font-black text-brand-900 mb-4">What do you want to be tested on?</h2>
        <p className="text-brand-500 font-medium mb-8">Enter a topic, and our AI will generate a comprehensive 10-question practice test for you.</p>
        
        <form onSubmit={handleGenerate} className="space-y-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., AP Calculus AB, Cell Biology, Python Programming..."
            className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 outline-none transition-all text-lg font-medium"
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={!topic.trim() || isGenerating}
            className="w-full py-4 bg-brand-900 text-white font-black rounded-2xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-xl shadow-brand-200"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                Generating Test...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2 fill-current" />
                Start Practice Test
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Footer Stats */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10"
      >
        {[
          { label: 'Tests Completed', value: loadingStats ? '...' : stats.completed.toString(), icon: FileText },
          { label: 'Average Score', value: loadingStats ? '...' : `${stats.average}%`, icon: BarChart3 },
          { label: 'Study Hours', value: loadingStats ? '...' : `${stats.hours}h`, icon: Clock },
        ].map((stat, i) => (
          <div key={i} className="bg-brand-50/50 border border-brand-100 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <stat.icon className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-brand-400 uppercase">{stat.label}</div>
              <div className="text-xl font-display font-bold text-brand-900">{stat.value}</div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default PracticeTests;
