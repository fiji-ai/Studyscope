import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Sparkles, GraduationCap, Zap, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import Logo from '../components/Logo';

const Login: React.FC = () => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error("Login failed:", error);
      alert("Failed to login with Google. Please ensure your Firebase configuration is set up in src/firebase.ts");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-50 flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side: Brand & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-600 relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-brand-500 rounded-full blur-3xl opacity-50" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-brand-700 rounded-full blur-3xl opacity-50" />
        
        <div className="relative z-10 max-w-lg space-y-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4"
          >
            <Logo className="w-16 h-16" />
            <h1 className="text-5xl font-display font-black text-white tracking-tight">StudyScope</h1>
          </motion.div>

          <div className="space-y-8">
            {[
              { icon: GraduationCap, title: "Personalized Learning", desc: "AI-driven paths tailored to your curriculum and goals." },
              { icon: Zap, title: "Instant Summaries", desc: "Turn long lectures into concise, actionable study notes." },
              { icon: Sparkles, title: "Smart Flashcards", desc: "Master any subject with automated active recall tools." }
            ].map((feature, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                key={i} 
                className="flex gap-6 items-start"
              >
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{feature.title}</h3>
                  <p className="text-brand-100 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white relative">
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          <Logo className="w-8 h-8" />
          <span className="font-display font-black text-brand-900 text-xl">StudyScope</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-10"
        >
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-4xl font-display font-black text-brand-900">Welcome Back!</h2>
            <p className="text-brand-500 font-medium">Your AI-powered study companion is ready when you are.</p>
          </div>

          <div className="bg-brand-50/50 rounded-[2.5rem] p-8 sm:p-10 border border-brand-100 space-y-8">
            <div className="space-y-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-4 py-4 px-6 bg-white border-2 border-brand-100 rounded-2xl shadow-sm hover:shadow-md hover:border-brand-200 transition-all group disabled:opacity-50"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
                <span className="text-lg font-bold text-brand-900">
                  {isLoggingIn ? 'Connecting...' : 'Continue with Google'}
                </span>
              </motion.button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-brand-100"></div></div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-brand-300">
                  <span className="bg-brand-50 px-4">Secure Authentication</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-brand-400 text-sm justify-center">
                <ShieldCheck className="w-4 h-4" />
                <span>Enterprise-grade security by Firebase</span>
              </div>
            </div>
          </div>

          <p className="text-center text-brand-400 text-sm px-8">
            By continuing, you agree to StudyScope's <a href="#" className="text-brand-600 font-bold hover:underline">Terms of Service</a> and <a href="#" className="text-brand-600 font-bold hover:underline">Privacy Policy</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
