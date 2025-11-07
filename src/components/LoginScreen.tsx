import React, { useState } from 'react';
import { ChatIcon, GoogleIcon } from '@/constants';
import { auth, db } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

const LoginScreen: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAuthAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isSignUp) {
                if(name.trim() === '') throw new Error("Please enter your name.");
                // Sign Up
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Create user document in Firestore
                await setDoc(doc(db, "users", user.uid), {
                    id: user.uid,
                    name: name,
                    email: user.email,
                    avatar: `https://i.pravatar.cc/150?u=${user.uid}`,
                    lastSeen: Timestamp.now(),
                    isOnline: true,
                });

            } else {
                // Sign In
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err: any) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user already exists in Firestore
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                // New user, create a document
                await setDoc(userDocRef, {
                    id: user.uid,
                    name: user.displayName,
                    email: user.email,
                    avatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
                    lastSeen: Timestamp.now(),
                    isOnline: true,
                });
            }
            // If user exists, just log them in, no need to update the doc unless you want to update lastSeen/isOnline here.
        } catch (err: any) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };


  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-blue-200 to-white p-6">
       <div className="text-center">
        <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-4 inline-block shadow-md mb-6">
            <ChatIcon className="w-12 h-12 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to MiniChat</h1>
        <p className="text-gray-600 mb-8">{isSignUp ? 'Create an account to start chatting' : 'Sign in to your account'}</p>
      </div>
      
      <div className="w-full max-w-sm">
        <form onSubmit={handleAuthAction}>
            {isSignUp && (
                <input
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 mb-4 bg-white/70 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            )}
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 mb-4 bg-white/70 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/70 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-blue-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 flex items-center justify-center disabled:bg-blue-400"
            >
              {loading && !isSignUp ? 'Signing In...' : loading && isSignUp ? 'Creating Account...': isSignUp ? 'Sign Up' : 'Sign In'}
            </button>

            <p className="text-sm text-gray-600 mt-6 text-center">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="font-semibold text-blue-600 hover:underline ml-1">
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
            </p>
        </form>

        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white text-gray-700 font-semibold py-3 rounded-lg shadow-md border border-gray-300 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center disabled:bg-gray-200"
        >
          <GoogleIcon className="w-5 h-5 mr-3" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
