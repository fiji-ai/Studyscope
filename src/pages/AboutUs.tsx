import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Users, Target, Heart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutUs: React.FC = () => {
  const stats = [
    { label: 'Students Helped', value: '10,000+', icon: Users },
    { label: 'Quizzes Created', value: '50,000+', icon: Target },
    { label: 'AI Summaries', value: '50,000', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-brand-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="p-2 hover:bg-brand-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-brand-600" />
          </Link>
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand-100 text-brand-600 text-[10px] font-black uppercase tracking-[0.2em]">
            <Sparkles className="w-3 h-3 mr-2" />
            Our Story
          </div>
        </div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <h1 className="text-5xl md:text-7xl font-display font-black text-brand-900 tracking-tight">
            Empowering the <span className="text-brand-600">Next Generation</span> of Learners.
          </h1>
          <p className="text-xl text-brand-500 font-medium max-w-2xl mx-auto leading-relaxed">
            StudyScope isn't just another study tool. It's your personal AI-powered academic companion, designed to make learning faster, smarter, and way more fun.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-[2rem] shadow-xl shadow-brand-100 border border-brand-100 text-center space-y-4"
            >
              <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto">
                <stat.icon className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <div className="text-3xl font-black text-brand-900">{stat.value}</div>
                <div className="text-sm text-brand-400 font-bold uppercase tracking-widest">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mission Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center pt-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-display font-black text-brand-900">Our Mission</h2>
            <p className="text-brand-500 leading-relaxed font-medium">
              We believe that every student has the potential to achieve greatness. Our mission is to provide the tools and technology that bridge the gap between effort and achievement. 
            </p>
            <p className="text-brand-500 leading-relaxed font-medium">
              By leveraging cutting-edge AI, we create personalized learning paths that adapt to your unique style, helping you master any subject with confidence.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="aspect-square bg-brand-200 rounded-[3rem] overflow-hidden shadow-2xl shadow-brand-200">
              <img 
                src="https://picsum.photos/seed/study/800/800" 
                alt="Students studying" 
                className="w-full h-full object-cover mix-blend-overlay opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-600/40 to-transparent" />
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-brand-100 max-w-[200px]">
              <p className="text-xs font-black text-brand-900 uppercase tracking-wider mb-2">Built for you</p>
              <p className="text-[10px] text-brand-500 font-medium leading-tight">Designed by educators and AI experts to revolutionize your study habits.</p>
            </div>
          </motion.div>
        </div>

        {/* Meet the Maker Section */}
        <div className="pt-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-brand-100 border border-brand-100 flex flex-col md:flex-row items-center gap-12"
          >
            <div className="w-48 h-48 rounded-[2rem] overflow-hidden shadow-xl flex-shrink-0 border-4 border-brand-50">
              <img 
                src="https://picsum.photos/seed/maker/400/400" 
                alt="The Maker" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-6 text-center md:text-left">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-[10px] font-black uppercase tracking-wider">
                Founder & Owner
              </div>
              <h2 className="text-4xl font-display font-black text-brand-900">Meet the Maker</h2>
              <p className="text-brand-500 font-medium leading-relaxed">
                Hey, I'm <span className="text-brand-600 font-black">Riddhish Ranjith</span>, the owner and creator of StudyScope! I built this because I wanted a tool that actually understands how we learn today. No more boring textbooks—just smart, AI-driven features that help you crush your goals.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="px-4 py-2 bg-brand-50 rounded-xl text-brand-600 text-xs font-bold">🚀 Innovation First</div>
                <div className="px-4 py-2 bg-brand-50 rounded-xl text-brand-600 text-xs font-bold">💡 Student Centric</div>
                <div className="px-4 py-2 bg-brand-50 rounded-xl text-brand-600 text-xs font-bold">🛠️ Built with Passion</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Fiji AI Section */}
        <div className="pt-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-brand-900 rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-brand-900/20 border border-brand-800 flex flex-col md:flex-row-reverse items-center gap-12 text-white"
          >
            <div className="w-48 h-48 rounded-[2rem] overflow-hidden shadow-xl flex-shrink-0 border-4 border-brand-800 bg-brand-800 flex items-center justify-center">
              <Sparkles className="w-20 h-20 text-brand-400" />
            </div>
            <div className="space-y-6 text-center md:text-left">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-800 text-brand-300 text-[10px] font-black uppercase tracking-wider">
                The Debutant Group
              </div>
              <h2 className="text-4xl font-display font-black text-white">Backed by Fiji AI</h2>
              <p className="text-brand-200 font-medium leading-relaxed">
                StudyScope is proudly supported by <span className="text-white font-black">Fiji AI</span>, a debutant group of forward-thinking innovators and technologists. As part of this exciting venture, the owner will be <span className="text-white font-black">Riddhish Ranjith</span>. Together, we are pushing the boundaries of educational technology to deliver smarter, faster, and more intuitive learning experiences for students worldwide.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="px-4 py-2 bg-brand-800 rounded-xl text-brand-300 text-xs font-bold">🌟 Rising Stars</div>
                <div className="px-4 py-2 bg-brand-800 rounded-xl text-brand-300 text-xs font-bold">🤝 Strategic Partners</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-brand-900 rounded-[3rem] p-12 text-center text-white space-y-6"
        >
          <h2 className="text-3xl font-display font-black">Ready to level up your learning?</h2>
          <p className="text-brand-200 font-medium max-w-md mx-auto">Join thousands of students who are already using StudyScope to crush their academic goals.</p>
          <Link 
            to="/dashboard" 
            className="inline-flex items-center px-8 py-4 bg-white text-brand-900 font-black rounded-2xl hover:bg-brand-50 transition-all group"
          >
            Get Started Now <ArrowLeft className="ml-2 w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUs;
