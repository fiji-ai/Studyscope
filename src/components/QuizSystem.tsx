import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, BrainCircuit, Play, Trophy, Clock, CheckCircle, XCircle } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizResult {
  id?: string;
  userId: string;
  subject: string;
  grade: string;
  score: number;
  totalQuestions: number;
  date: string;
}

const QuizSystem: React.FC = () => {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState(user?.grade || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [pastResults, setPastResults] = useState<QuizResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!user?.id) return;
      try {
        const q = query(
          collection(db, 'quizResults'),
          where('userId', '==', user.id),
          orderBy('date', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as QuizResult[];
        setPastResults(results);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'quizResults');
      } finally {
        setLoadingResults(false);
      }
    };

    fetchResults();
  }, [user?.id, quizFinished]);

  const generateQuiz = async () => {
    if (!subject || !grade) return;
    
    setIsGenerating(true);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizFinished(false);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a multiple-choice quiz with 5 questions about ${subject} for a student in ${grade}.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING, description: "The quiz question" },
                options: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "4 possible answers" 
                },
                correctAnswer: { 
                  type: Type.INTEGER, 
                  description: "The index (0-3) of the correct answer in the options array" 
                },
                explanation: { 
                  type: Type.STRING, 
                  description: "Brief explanation of why the answer is correct" 
                }
              },
              required: ["question", "options", "correctAnswer", "explanation"]
            }
          }
        }
      });

      const generatedQuestions = JSON.parse(response.text || '[]');
      setQuestions(generatedQuestions);
    } catch (error) {
      console.error("Error generating quiz:", error);
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSelect = (index: number) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(index);
  };

  const checkAnswer = () => {
    if (selectedAnswer === null) return;
    
    setIsAnswerChecked(true);
    if (selectedAnswer === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setQuizFinished(true);
    
    // Save result to Firestore
    if (user?.id) {
      try {
        await addDoc(collection(db, 'quizResults'), {
          userId: user.id,
          subject,
          grade,
          score: score,
          totalQuestions: questions.length,
          date: new Date().toISOString()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'quizResults');
      }
    }
  };


  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Quiz Generator Panel */}
        <div className="w-full md:w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <BrainCircuit className="w-5 h-5 mr-2 text-indigo-600" />
            New Quiz
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Biology, World History"
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={questions.length > 0 && !quizFinished}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={questions.length > 0 && !quizFinished}
              >
                <option value="">Select Grade</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={generateQuiz}
              disabled={!subject || !grade || isGenerating || (questions.length > 0 && !quizFinished)}
              className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isGenerating ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </span>
              ) : (
                <span className="flex items-center">
                  <Play className="w-4 h-4 mr-2" />
                  Start Quiz
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Quiz Area */}
        <div className="w-full md:w-2/3">
          {questions.length === 0 && !isGenerating ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center h-full flex flex-col items-center justify-center">
              <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Ready to test your knowledge?</h3>
              <p className="text-gray-500 mt-2">Select a subject and grade level to generate a custom AI quiz.</p>
            </div>
          ) : isGenerating ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900">AI is crafting your questions...</h3>
              <p className="text-gray-500 mt-2">This usually takes about 5-10 seconds.</p>
            </div>
          ) : quizFinished ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
              <p className="text-xl text-gray-600 mb-6">
                You scored <span className="font-bold text-indigo-600">{score}</span> out of {questions.length}
              </p>
              
              <div className="w-full bg-gray-200 rounded-full h-4 mb-8">
                <div 
                  className={`h-4 rounded-full ${score / questions.length > 0.7 ? 'bg-green-500' : score / questions.length > 0.4 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${(score / questions.length) * 100}%` }}
                ></div>
              </div>
              
              <button 
                onClick={() => setQuestions([])}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              >
                Take Another Quiz
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex justify-between items-center">
                <span className="font-medium text-indigo-800">Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span className="text-sm text-indigo-600 font-medium">Score: {score}</span>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-medium text-gray-900 mb-6">
                  {questions[currentQuestionIndex].question}
                </h3>
                
                <div className="space-y-3">
                  {questions[currentQuestionIndex].options.map((option, index) => {
                    let buttonClass = "w-full text-left p-4 rounded-lg border transition-all ";
                    
                    if (!isAnswerChecked) {
                      buttonClass += selectedAnswer === index 
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700" 
                        : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50";
                    } else {
                      if (index === questions[currentQuestionIndex].correctAnswer) {
                        buttonClass += "border-green-500 bg-green-50 text-green-800";
                      } else if (index === selectedAnswer) {
                        buttonClass += "border-red-500 bg-red-50 text-red-800";
                      } else {
                        buttonClass += "border-gray-200 opacity-50";
                      }
                    }
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={isAnswerChecked}
                        className={buttonClass}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {isAnswerChecked && index === questions[currentQuestionIndex].correctAnswer && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                          {isAnswerChecked && index === selectedAnswer && index !== questions[currentQuestionIndex].correctAnswer && (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                {isAnswerChecked && (
                  <div className={`mt-6 p-4 rounded-lg ${selectedAnswer === questions[currentQuestionIndex].correctAnswer ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <p className="font-medium mb-1">
                      {selectedAnswer === questions[currentQuestionIndex].correctAnswer ? 'Correct!' : 'Incorrect.'}
                    </p>
                    <p className="text-sm text-gray-700">{questions[currentQuestionIndex].explanation}</p>
                  </div>
                )}
                
                <div className="mt-8 flex justify-end">
                  {!isAnswerChecked ? (
                    <button
                      onClick={checkAnswer}
                      disabled={selectedAnswer === null}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <button
                      onClick={nextQuestion}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Past Results */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-gray-500" />
          Recent Quiz Results
        </h2>
        
        {loadingResults ? (
          <p className="text-gray-500">Loading past results...</p>
        ) : pastResults.length === 0 ? (
          <p className="text-gray-500 italic">No past quizzes found. Take a quiz to see your history!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pastResults.map((result) => (
                  <tr key={result.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(result.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {result.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.grade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        result.score / result.totalQuestions > 0.7 ? 'bg-green-100 text-green-800' : 
                        result.score / result.totalQuestions > 0.4 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.score} / {result.totalQuestions}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizSystem;
