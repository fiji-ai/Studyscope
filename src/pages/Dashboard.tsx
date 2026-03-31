import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, BrainCircuit, Library, Trophy, ArrowRight, Sparkles, Target, Zap } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import StudyTimer from '../components/StudyTimer';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [quizAverage, setQuizAverage] = useState<number>(0);
  const [quizzesTaken, setQuizzesTaken] = useState<number>(0);
  const [subjectsStudied, setSubjectsStudied] = useState<number>(0);
  const [questionsAnswered, setQuestionsAnswered] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      try {
        const qQuizzes = query(
          collection(db, 'quizResults'),
          where('userId', '==', user.id)
        );
        const qTests = query(
          collection(db, 'practiceTestResults'),
          where('userId', '==', user.id)
        );

        const [quizSnapshot, testSnapshot] = await Promise.all([
          getDocs(qQuizzes),
          getDocs(qTests)
        ]);
        
        let totalScore = 0;
        let totalQuestions = 0;
        let count = 0;
        const subjects = new Set<string>();

        quizSnapshot.forEach((doc) => {
          const data = doc.data();
          totalScore += data.score || 0;
          totalQuestions += data.totalQuestions || 0;
          if (data.subject) {
            subjects.add(data.subject.toLowerCase());
          }
          count += 1;
        });

        testSnapshot.forEach((doc) => {
          const data = doc.data();
          totalScore += data.score || 0;
          totalQuestions += data.totalQuestions || 0;
          if (data.topic) {
            subjects.add(data.topic.toLowerCase());
          }
          count += 1;
        });

        setQuizzesTaken(count);
        setSubjectsStudied(subjects.size);
        setQuestionsAnswered(totalQuestions);

        if (totalQuestions > 0) {
          setQuizAverage(Math.round((totalScore / totalQuestions) * 100));
        } else {
          setQuizAverage(0);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'quizResults/practiceTestResults');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.id]);

  const stats = [
    { name: 'Subjects', value: subjectsStudied.toString(), icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
    { name: 'Questions', value: questionsAnswered.toString(), icon: BrainCircuit, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' },
    { name: 'Quizzes', value: quizzesTaken.toString(), icon: Library, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' },
    { name: 'Average', value: `${quizAverage}%`, icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-10"
    >
      {/* Hero Section */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 rounded-[2.5rem] p-8 sm:p-12 text-white shadow-2xl shadow-brand-200"
      >
        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-white/10"
          >
            <Sparkles className="w-3 h-3 mr-2 text-amber-300" />
            Your Learning Journey
          </motion.div>
          <h1 className="text-4xl sm:text-6xl font-black mb-6 leading-[1.1] font-display tracking-tight">
            Welcome back, <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-200 to-white">{user?.name}</span>!
          </h1>
          <p className="text-brand-100 text-lg sm:text-xl max-w-xl mb-10 font-medium leading-relaxed">
            You're doing great! You've already mastered <span className="font-black text-white underline decoration-brand-400 decoration-4 underline-offset-4">{subjectsStudied} subjects</span>. 
            Ready to level up your {user?.grade} knowledge today?
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/journey" className="px-8 py-4 bg-white text-brand-700 font-black rounded-2xl hover:bg-brand-50 transition-all flex items-center shadow-xl hover:shadow-2xl active:scale-95 group">
              Continue Journey <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/tutor" className="px-8 py-4 bg-brand-500/30 backdrop-blur-md border border-white/30 text-white font-black rounded-2xl hover:bg-brand-500/40 transition-all flex items-center active:scale-95">
              Ask AI Tutor <Zap className="ml-3 w-5 h-5 text-amber-300" />
            </Link>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 20, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-brand-400/20 rounded-full blur-3xl" 
        />
        <div className="absolute top-1/2 right-10 -translate-y-1/2 hidden lg:block opacity-10">
          <BrainCircuit className="w-80 h-80" />
        </div>
        
        {/* Floating icons */}
        <motion.div 
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 right-1/4 hidden sm:block opacity-30"
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>
        <motion.div 
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-10 right-1/3 hidden sm:block opacity-30"
        >
          <Zap className="w-6 h-6 text-white" />
        </motion.div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.name} 
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            className={`bg-white p-6 rounded-[2rem] border-2 ${stat.border} shadow-lg shadow-gray-100 hover:shadow-xl transition-all flex flex-col items-center text-center sm:text-left sm:items-start relative overflow-hidden group`}
          >
            <div className={`p-4 rounded-2xl ${stat.bg} mb-5 group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <div className="space-y-1 relative z-10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{stat.name}</p>
              <h3 className="text-3xl sm:text-4xl font-black text-gray-900 leading-none font-display">
                {loading ? '...' : stat.value}
              </h3>
            </div>
            {/* Background Pattern */}
            <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full ${stat.bg} opacity-10 group-hover:scale-150 transition-transform duration-500`} />
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Recent Activity */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden"
        >
          <div className="p-8 sm:p-10 flex items-center justify-between border-b border-gray-50 bg-gradient-to-r from-gray-50/50 to-white">
            <h2 className="text-2xl font-black text-gray-900 flex items-center font-display tracking-tight">
              <div className="bg-brand-100 p-2 rounded-lg mr-4">
                <Target className="w-6 h-6 text-brand-600" />
              </div>
              Recent Progress
            </h2>
            <Link to="/journey" className="text-brand-600 text-sm font-black hover:underline uppercase tracking-wider">View All</Link>
          </div>
          
          <div className="p-8 sm:p-10">
            {quizzesTaken === 0 ? (
              <div className="text-center py-16 bg-gray-50/50 rounded-[2rem] border-4 border-dashed border-gray-100">
                <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gray-200">
                  <BookOpen className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2 font-display">Ready to start?</h3>
                <p className="text-gray-500 mb-8 px-6 max-w-md mx-auto font-medium">Your learning dashboard will show your progress once you start studying.</p>
                <Link to="/quizzes" className="inline-flex items-center px-8 py-4 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 transition-all shadow-xl shadow-brand-200 active:scale-95">
                  Take Your First Quiz
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                <motion.div 
                  whileHover={{ x: 10 }}
                  className="group flex items-center p-6 bg-gray-50 hover:bg-brand-50 rounded-[2rem] transition-all border-2 border-transparent hover:border-brand-100 cursor-pointer"
                >
                  <div className="bg-white p-4 rounded-2xl mr-6 shadow-md group-hover:scale-110 transition-transform">
                    <Trophy className="w-7 h-7 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-gray-900 font-display">Latest Quiz Performance</h3>
                    <p className="text-sm text-gray-500 font-medium">You're maintaining a solid {quizAverage}% average!</p>
                  </div>
                  <div className="bg-white p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-5 h-5 text-brand-600" />
                  </div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ x: 10 }}
                  className="group flex items-center p-6 bg-gray-50 hover:bg-brand-50 rounded-[2rem] transition-all border-2 border-transparent hover:border-brand-100 cursor-pointer"
                >
                  <div className="bg-white p-4 rounded-2xl mr-6 shadow-md group-hover:scale-110 transition-transform">
                    <BrainCircuit className="w-7 h-7 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-gray-900 font-display">AI Tutor Sessions</h3>
                    <p className="text-sm text-gray-500 font-medium">Keep asking questions to deepen your understanding.</p>
                  </div>
                  <div className="bg-white p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-5 h-5 text-brand-600" />
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Column: Quick Actions / Recommendations */}
        <motion.div 
          variants={itemVariants}
          className="space-y-8"
        >
          {/* Study Timer Component */}
          <StudyTimer />

          {/* Daily Goal Card */}
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-100 p-8 relative overflow-hidden">
            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center font-display tracking-tight">
              <div className="bg-amber-100 p-2 rounded-lg mr-4">
                <Zap className="w-6 h-6 text-amber-500" />
              </div>
              Daily Goal
            </h2>
            <div className="space-y-6">
              <div className="flex justify-between items-end mb-2">
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Progress</p>
                <p className="text-2xl font-black text-brand-600 font-display">75%</p>
              </div>
              <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-brand-500 to-brand-600 shadow-lg shadow-brand-200"
                />
              </div>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Complete <span className="text-brand-600 font-black">2 more quizzes</span> to reach your daily goal and earn a <span className="text-amber-500 font-black">Super Star!</span>
              </p>
            </div>
            {/* Background Pattern */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-50 rounded-full blur-3xl opacity-50" />
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-100 p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center font-display tracking-tight">
              <div className="bg-brand-50 p-2 rounded-lg mr-4">
                <Sparkles className="w-6 h-6 text-brand-500" />
              </div>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <Link to="/tutor" className="flex items-center p-5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-2xl transition-all font-black group">
                <div className="bg-white p-3 rounded-xl mr-5 shadow-md group-hover:rotate-12 transition-transform">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                AI Tutor
              </Link>
              <Link to="/notes" className="flex items-center p-5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl transition-all font-black group">
                <div className="bg-white p-3 rounded-xl mr-5 shadow-md group-hover:rotate-12 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                My Notes
              </Link>
              <Link to="/games" className="flex items-center p-5 bg-green-50 hover:bg-green-100 text-green-700 rounded-2xl transition-all font-black group">
                <div className="bg-white p-3 rounded-xl mr-5 shadow-md group-hover:rotate-12 transition-transform">
                  <Zap className="w-6 h-6" />
                </div>
                Study Games
              </Link>
            </div>
          </div>

          <div className="bg-indigo-900 rounded-[2.5rem] shadow-2xl p-10 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <div className="bg-white/20 backdrop-blur-md w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-amber-300" />
              </div>
              <h3 className="text-2xl font-black mb-3 font-display tracking-tight">Pro Tip!</h3>
              <p className="text-indigo-200 text-base mb-8 leading-relaxed">
                Try the "AI Summarizer" to turn long chapters into quick bullet points.
              </p>
              <Link to="/ai-summaries" className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-sm font-black text-white transition-all group">
                Try it now <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <motion.div 
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-10 -right-10 opacity-10"
            >
              <Sparkles className="w-48 h-48" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
