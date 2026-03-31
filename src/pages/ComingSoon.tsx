import React from 'react';
import { Wrench, Sparkles, Rocket } from 'lucide-react';
import { motion } from 'motion/react';

const ComingSoon: React.FC = () => {
  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[40%] h-[40%] bg-brand-200/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[40%] h-[40%] bg-brand-100/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl shadow-brand-100/50 border border-brand-100 p-12 md:p-20 relative overflow-hidden"
      >
        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-100 to-transparent rounded-full blur-3xl -mr-32 -mt-32 opacity-60" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-brand-200 to-transparent rounded-full blur-3xl -ml-32 -mb-32 opacity-40" />

        <div className="relative z-10 space-y-10">
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="w-24 h-24 bg-gradient-to-br from-brand-600 to-brand-900 rounded-[2rem] shadow-2xl shadow-brand-200 flex items-center justify-center mx-auto"
          >
            <Rocket className="w-12 h-12 text-white" />
          </motion.div>

          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 text-brand-600 text-xs font-black uppercase tracking-[0.2em]"
            >
              <Sparkles className="w-4 h-4" />
              Under Construction
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl font-display font-black text-brand-900 tracking-tight"
            >
              Coming Soon!
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-brand-500 text-lg md:text-xl font-medium max-w-md mx-auto leading-relaxed"
            >
              We are working hard to bring you this feature. Something amazing is being built right now!
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-2 text-brand-300 font-black text-xs uppercase tracking-[0.3em]"
          >
            <Wrench className="w-4 h-4" />
            Stay Tuned
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ComingSoon;
