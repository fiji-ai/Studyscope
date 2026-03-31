import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

export interface UserData {
  id: string;
  email: string;
  name: string;
  country?: string;
  board?: string;
  grade?: string;
  academicYear?: string;
  isPremium: boolean;
  isOnboarded: boolean;
  role?: 'student' | 'owner';
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let unsubscribeSnapshot: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const isOwner = firebaseUser.email?.toLowerCase() === 'riddhish257@gmail.com';

          // First check if user exists, if not create it
          const userDoc = await getDoc(userDocRef);
          if (!userDoc.exists()) {
            const newUser: UserData = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || '',
              isPremium: isOwner,
              isOnboarded: false,
              role: isOwner ? 'owner' : 'student'
            };
            await setDoc(userDocRef, newUser);
          } else {
            const data = userDoc.data() as UserData;
            if (isOwner && (!data.isPremium || data.role !== 'owner')) {
              await updateDoc(userDocRef, { isPremium: true, role: 'owner' });
            }
          }

          // Then listen to changes in real-time
          unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
              setUser({ id: docSnap.id, ...docSnap.data() } as UserData);
            } else {
              setUser(null);
            }
            setLoading(false);
          }, (err) => {
            setLoading(false);
            try {
              handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
            } catch (e) {
              setError(e as Error);
            }
          });

        } catch (err) {
          setLoading(false);
          try {
            handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
          } catch (e) {
            setError(e as Error);
          }
        }
      } else {
        setUser(null);
        setLoading(false);
        if (unsubscribeSnapshot) unsubscribeSnapshot();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  if (error) {
    throw error; // Throw to ErrorBoundary
  }

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  const updateUser = async (data: Partial<UserData>) => {
    if (!user) return;
    
    try {
      const userDocRef = doc(db, 'users', user.id);
      await updateDoc(userDocRef, data);
      setUser({ ...user, ...data });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.id}`);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
