import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Settings, Users, Layout, ShieldCheck, Paintbrush, Trash2, Edit, CheckCircle, XCircle, Star, FileText, RefreshCw, BarChart3, Shield, Zap } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  isPremium: boolean;
  isOnboarded: boolean;
}

interface QuizResultData {
  id: string;
  userId: string;
  subject: string;
  grade: string;
  score: number;
  totalQuestions: number;
  date: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState<UserData[]>([]);
  const [quizzesList, setQuizzesList] = useState<QuizResultData[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAdminStats = async () => {
    if (user?.role !== 'owner') return;
    setLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      setTotalUsers(usersSnapshot.size);
      
      const usersData: UserData[] = [];
      usersSnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() } as UserData);
      });
      setUsersList(usersData);

      const q = query(collection(db, 'quizResults'), orderBy('date', 'desc'), limit(50));
      const quizzesSnapshot = await getDocs(q);
      setTotalQuizzes(quizzesSnapshot.size);
      
      const quizzesData: QuizResultData[] = [];
      quizzesSnapshot.forEach((doc) => {
        quizzesData.push({ id: doc.id, ...doc.data() } as QuizResultData);
      });
      setQuizzesList(quizzesData);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'admin_stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, [user?.role]);

  const handleRoleChange = async (userId: string, currentRole: string) => {
    if (userId === user?.id) {
      alert("You cannot change your own role.");
      return;
    }
    
    const newRole = currentRole === 'owner' ? 'student' : 'owner';
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    
    setActionLoading(userId);
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      await fetchAdminStats();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
      alert("Failed to update user role.");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePremiumToggle = async (userId: string, currentPremium: boolean) => {
    if (userId === user?.id) {
      alert("You cannot change your own premium status.");
      return;
    }
    
    const newPremium = !currentPremium;
    if (!window.confirm(`Are you sure you want to ${newPremium ? 'grant' : 'revoke'} premium status for this user?`)) return;
    
    setActionLoading(userId);
    try {
      await updateDoc(doc(db, 'users', userId), { isPremium: newPremium });
      await fetchAdminStats();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
      alert("Failed to update premium status.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?.id) {
      alert("You cannot delete your own account from here.");
      return;
    }
    
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    setActionLoading(userId);
    try {
      await deleteDoc(doc(db, 'users', userId));
      await fetchAdminStats();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
      alert("Failed to delete user.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!window.confirm("Are you sure you want to delete this quiz result?")) return;
    
    setActionLoading(quizId);
    try {
      await deleteDoc(doc(db, 'quizResults', quizId));
      await fetchAdminStats();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `quizResults/${quizId}`);
      alert("Failed to delete quiz result.");
    } finally {
      setActionLoading(null);
    }
  };

  if (user?.role !== 'owner') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-12 text-center max-w-md mx-auto bg-white rounded-[2.5rem] shadow-xl border border-red-100 mt-20"
      >
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-display font-black text-brand-900">Access Denied</h1>
        <p className="text-brand-500 mt-2 font-medium">You do not have permission to view this page.</p>
      </motion.div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Layout },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'quizzes', label: 'Quizzes', icon: FileText },
    { id: 'customize', label: 'Design', icon: Paintbrush },
    { id: 'settings', label: 'System', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-brand-900 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-brand-200"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-400/20 rounded-full blur-3xl -ml-32 -mb-32" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-xs font-black uppercase tracking-widest">
              <Shield className="w-3 h-3" />
              Super Admin Access
            </div>
            <h1 className="text-4xl font-display font-black">Control Center</h1>
            <p className="text-brand-200 font-medium max-w-md">Manage users, analyze platform performance, and customize the StudyScope experience.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-brand-300 text-sm font-bold uppercase">Active Owner</div>
              <div className="text-xl font-black">{user?.name}</div>
            </div>
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-8 h-8 text-brand-400" />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-brand-50 border border-brand-100 p-4 sticky top-8">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-brand-900 text-white shadow-lg shadow-brand-200' 
                      : 'text-brand-400 hover:bg-brand-50 hover:text-brand-900'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
            
            <div className="mt-8 p-6 bg-brand-50 rounded-3xl border border-brand-100">
              <div className="text-xs font-black text-brand-300 uppercase tracking-widest mb-4">System Status</div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-brand-500 font-bold">Database</span>
                  <span className="flex items-center gap-1.5 text-green-600 font-black">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Online
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-brand-500 font-bold">AI Engine</span>
                  <span className="flex items-center gap-1.5 text-green-600 font-black">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[3rem] shadow-xl shadow-brand-50 border border-brand-100 p-8 md:p-10 min-h-[600px]"
          >
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="space-y-8"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-display font-black text-brand-900">Platform Overview</h2>
                    <button onClick={fetchAdminStats} className="p-2 hover:bg-brand-50 rounded-xl transition-all text-brand-400">
                      <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-brand-50 p-8 rounded-[2rem] border border-brand-100 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Users className="w-16 h-16" />
                      </div>
                      <p className="text-sm text-brand-400 font-black uppercase tracking-widest">Total Users</p>
                      <p className="text-5xl font-display font-black text-brand-900 mt-2">{loading ? '...' : totalUsers}</p>
                    </div>
                    <div className="bg-brand-50 p-8 rounded-[2rem] border border-brand-100 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Zap className="w-16 h-16" />
                      </div>
                      <p className="text-sm text-brand-400 font-black uppercase tracking-widest">Quizzes Generated</p>
                      <p className="text-5xl font-display font-black text-brand-900 mt-2">{loading ? '...' : totalQuizzes}</p>
                    </div>
                  </div>

                  <div className="bg-brand-900/5 p-8 rounded-[2rem] border border-brand-100">
                    <div className="flex items-center gap-3 mb-6">
                      <BarChart3 className="w-6 h-6 text-brand-600" />
                      <h3 className="text-lg font-display font-black text-brand-900">Growth Analytics</h3>
                    </div>
                    <div className="h-48 flex items-end gap-2">
                      {[40, 60, 45, 90, 65, 85, 100].map((h, i) => (
                        <motion.div 
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          className="flex-1 bg-brand-900/10 rounded-t-lg hover:bg-brand-900/20 transition-all cursor-pointer"
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs font-bold text-brand-300 uppercase tracking-widest">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'users' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-display font-black text-brand-900">User Management</h2>
                    <button onClick={fetchAdminStats} className="text-sm font-black text-brand-600 hover:text-brand-900 uppercase tracking-widest">
                      Refresh
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto -mx-8 md:-mx-10 px-8 md:px-10">
                    <table className="w-full text-left border-separate border-spacing-y-3">
                      <thead>
                        <tr className="text-brand-300 text-xs font-black uppercase tracking-widest">
                          <th className="px-6 py-4">User</th>
                          <th className="px-6 py-4">Role</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersList.map((u) => (
                          <tr key={u.id} className="bg-brand-50/50 hover:bg-brand-50 transition-colors">
                            <td className="px-6 py-5 rounded-l-3xl">
                              <div className="font-black text-brand-900">{u.name}</div>
                              <div className="text-xs text-brand-400 font-medium">{u.email}</div>
                            </td>
                            <td className="px-6 py-5">
                              {u.role === 'owner' ? (
                                <span className="px-3 py-1 bg-brand-900 text-white rounded-full text-[10px] font-black uppercase tracking-wider">Owner</span>
                              ) : (
                                <span className="px-3 py-1 bg-white border border-brand-100 text-brand-600 rounded-full text-[10px] font-black uppercase tracking-wider">{u.role}</span>
                              )}
                            </td>
                            <td className="px-6 py-5">
                              {u.isPremium ? (
                                <div className="flex items-center gap-1.5 text-brand-600 font-black text-xs">
                                  <Star className="w-3 h-3 fill-current" />
                                  Premium
                                </div>
                              ) : (
                                <div className="text-brand-300 font-bold text-xs">Standard</div>
                              )}
                            </td>
                            <td className="px-6 py-5 rounded-r-3xl text-right">
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => handleRoleChange(u.id, u.role)}
                                  disabled={actionLoading === u.id || u.id === user?.id}
                                  className="p-2 hover:bg-white rounded-xl transition-all text-brand-400 hover:text-brand-900"
                                  title="Toggle Role"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handlePremiumToggle(u.id, u.isPremium)}
                                  disabled={actionLoading === u.id || u.id === user?.id}
                                  className="p-2 hover:bg-white rounded-xl transition-all text-brand-400 hover:text-brand-600"
                                  title="Toggle Premium"
                                >
                                  <Star className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteUser(u.id)}
                                  disabled={actionLoading === u.id || u.id === user?.id}
                                  className="p-2 hover:bg-red-50 rounded-xl transition-all text-brand-400 hover:text-red-500"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'quizzes' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <h2 className="text-2xl font-display font-black text-brand-900">Quiz History</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {quizzesList.map((q) => (
                      <div key={q.id} className="bg-brand-50/50 p-6 rounded-3xl border border-brand-100 flex flex-wrap justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                            <FileText className="w-6 h-6 text-brand-400" />
                          </div>
                          <div>
                            <div className="font-black text-brand-900">{q.subject}</div>
                            <div className="text-xs text-brand-400 font-bold uppercase tracking-wider">Grade {q.grade} • {new Date(q.date).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-[10px] font-black text-brand-300 uppercase tracking-widest">Score</div>
                            <div className={`text-xl font-display font-black ${q.score / q.totalQuestions >= 0.7 ? 'text-green-600' : 'text-brand-600'}`}>
                              {q.score}/{q.totalQuestions}
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteQuiz(q.id)}
                            className="p-3 hover:bg-red-50 rounded-2xl transition-all text-brand-300 hover:text-red-500"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'customize' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <h2 className="text-2xl font-display font-black text-brand-900">Design System</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 bg-brand-50 rounded-[2rem] border border-brand-100 space-y-4">
                      <h3 className="font-black text-brand-900 uppercase tracking-widest text-sm">Brand Palette</h3>
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-brand-900 ring-4 ring-brand-100 cursor-pointer" />
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 cursor-pointer" />
                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 cursor-pointer" />
                        <div className="w-12 h-12 rounded-2xl bg-rose-600 cursor-pointer" />
                      </div>
                    </div>
                    <div className="p-8 bg-brand-50 rounded-[2rem] border border-brand-100 space-y-4">
                      <h3 className="font-black text-brand-900 uppercase tracking-widest text-sm">Hero Message</h3>
                      <input 
                        type="text" 
                        placeholder="Welcome to StudyScope!" 
                        className="w-full bg-white border-2 border-brand-100 rounded-2xl p-4 font-bold text-brand-900 focus:outline-none focus:border-brand-900 transition-all" 
                      />
                    </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-brand-900 text-white font-black rounded-2xl shadow-xl shadow-brand-100"
                  >
                    Save Design Changes
                  </motion.button>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <h2 className="text-2xl font-display font-black text-brand-900">System Configuration</h2>
                  <div className="space-y-4">
                    {[
                      { title: 'Allow New Registrations', desc: 'Enable or disable new user signups.', active: true },
                      { title: 'Maintenance Mode', desc: 'Take the site offline for critical updates.', active: false },
                      { title: 'AI Features', desc: 'Enable Gemini-powered study tools.', active: true },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-8 bg-brand-50 rounded-[2rem] border border-brand-100">
                        <div>
                          <h3 className="font-black text-brand-900">{s.title}</h3>
                          <p className="text-sm text-brand-400 font-medium">{s.desc}</p>
                        </div>
                        <button className={`w-14 h-8 rounded-full relative transition-all ${s.active ? 'bg-brand-900' : 'bg-brand-200'}`}>
                          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${s.active ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
