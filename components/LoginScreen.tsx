import React, { useState } from 'react';
import { ChatIcon } from '../constants';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

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


  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-blue-200 to-white p-6">
       <div className="text-center">
        <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-4 inline-block shadow-md mb-6">
            <ChatIcon className="w-12 h-12 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to MiniChat</h1>
        <p className="text-gray-600 mb-8">{isSignUp ? 'Create an account to start chatting' : 'Sign in to your account'}</p>
      </div>
      
      <form onSubmit={handleAuthAction} className="w-full max-w-sm">
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
          {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
        </button>

        <p className="text-sm text-gray-600 mt-6 text-center">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="font-semibold text-blue-600 hover:underline ml-1">
                {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
        </p>
      </form>
    </div>
  );
};

export default LoginScreen;
