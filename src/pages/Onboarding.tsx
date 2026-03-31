import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, GraduationCap, Calendar, BookOpen, ChevronRight, Sparkles } from 'lucide-react';
import Logo from '../components/Logo';

const Onboarding: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    country: '',
    board: '',
    grade: '',
    academicYear: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser({ ...formData, isOnboarded: true });
      navigate('/dashboard');
    } catch (error) {
      console.error("Onboarding failed:", error);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const steps = [
    { id: 1, title: "Location", icon: MapPin, desc: "Where are you studying?" },
    { id: 2, title: "Curriculum", icon: BookOpen, desc: "Select your education board." },
    { id: 3, title: "Grade", icon: GraduationCap, desc: "What's your current level?" },
    { id: 4, title: "Year", icon: Calendar, desc: "Current academic session." }
  ];

  return (
    <div className="min-h-screen bg-brand-50 flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05),transparent)] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl shadow-brand-200 border border-brand-100 overflow-hidden relative z-10"
      >
        {/* Progress Header */}
        <div className="bg-brand-600 p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-brand-200 font-bold text-sm uppercase tracking-widest">
                <Sparkles className="w-4 h-4" />
                <span>Step {step} of 4</span>
              </div>
              <Logo className="w-12 h-12" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-black">
              Welcome, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-brand-100 text-lg">Let's personalize your AI study companion.</p>
          </div>

          {/* Step Indicator */}
          <div className="absolute bottom-0 left-0 w-full h-2 bg-white/10">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(step / 4) * 100}%` }}
              className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)]"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-10">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-900">Your Location</h3>
                    <p className="text-brand-500 text-sm">We'll adapt to your local education standards.</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="country" className="block text-sm font-bold text-brand-900 uppercase tracking-wider">Select Country</label>
                  <select
                    id="country"
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-brand-50 border-2 border-brand-100 rounded-2xl focus:outline-none focus:border-brand-500 transition-all text-lg font-medium text-brand-900 appearance-none cursor-pointer"
                  >
                    <option value="">Choose your country...</option>
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                    <option value="UK">United Kingdom</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-900">Education Board</h3>
                    <p className="text-brand-500 text-sm">Which curriculum do you follow?</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="board" className="block text-sm font-bold text-brand-900 uppercase tracking-wider">Select Board</label>
                  <select
                    id="board"
                    name="board"
                    required
                    value={formData.board}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-brand-50 border-2 border-brand-100 rounded-2xl focus:outline-none focus:border-brand-500 transition-all text-lg font-medium text-brand-900 appearance-none cursor-pointer"
                  >
                    <option value="">Choose your board...</option>
                    {formData.country === 'India' && (
                      <>
                        <option value="CBSE">CBSE (Central Board)</option>
                        <option value="ICSE">ICSE / ISC</option>
                        <option value="State Board">State Board</option>
                        <option value="IB">IB (International Baccalaureate)</option>
                      </>
                    )}
                    {formData.country === 'USA' && (
                      <>
                        <option value="Common Core">Common Core</option>
                        <option value="AP">Advanced Placement (AP)</option>
                        <option value="IB">IB Diploma</option>
                      </>
                    )}
                    {!['India', 'USA'].includes(formData.country) && (
                      <>
                        <option value="National Curriculum">National Curriculum</option>
                        <option value="International">International / IB</option>
                        <option value="Other">Other</option>
                      </>
                    )}
                  </select>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-900">Current Grade</h3>
                    <p className="text-brand-500 text-sm">Help us find the right difficulty level.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[...Array(12)].map((_, i) => (
                    <motion.button
                      key={i}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFormData({ ...formData, grade: `Grade ${i + 1}` })}
                      className={`py-4 rounded-2xl font-bold text-lg transition-all border-2 ${
                        formData.grade === `Grade ${i + 1}`
                          ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-200'
                          : 'bg-brand-50 border-brand-100 text-brand-900 hover:border-brand-300'
                      }`}
                    >
                      Grade {i + 1}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-900">Academic Year</h3>
                    <p className="text-brand-500 text-sm">Last step! When are you graduating?</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {['2024-25', '2025-26', '2026-27'].map((year) => (
                    <motion.button
                      key={year}
                      type="button"
                      whileHover={{ x: 10 }}
                      onClick={() => setFormData({ ...formData, academicYear: year })}
                      className={`w-full p-6 rounded-2xl font-bold text-xl text-left flex justify-between items-center transition-all border-2 ${
                        formData.academicYear === year
                          ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-200'
                          : 'bg-brand-50 border-brand-100 text-brand-900 hover:border-brand-300'
                      }`}
                    >
                      {year}
                      <ChevronRight className={`w-6 h-6 ${formData.academicYear === year ? 'text-white' : 'text-brand-300'}`} />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-8 py-4 bg-brand-50 text-brand-600 font-bold rounded-2xl hover:bg-brand-100 transition-colors"
              >
                Back
              </button>
            )}
            
            {step < 4 ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={nextStep}
                disabled={
                  (step === 1 && !formData.country) ||
                  (step === 2 && !formData.board) ||
                  (step === 3 && !formData.grade)
                }
                className="flex-1 py-4 bg-brand-900 text-white font-black text-lg rounded-2xl shadow-xl shadow-brand-200 hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Next Step <ChevronRight className="w-5 h-5" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={!formData.academicYear}
                className="flex-1 py-4 bg-brand-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-brand-200 hover:bg-brand-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Launch StudyScope <Sparkles className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Onboarding;
