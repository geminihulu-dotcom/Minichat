
import React, { useEffect } from 'react';
import { ChatIcon } from '@/constants';

interface SplashScreenProps {
  onAnimationEnd: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationEnd }) => {
  useEffect(() => {
    onAnimationEnd();
  }, [onAnimationEnd]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-blue-400 to-blue-200 text-white">
      <div className="flex flex-col items-center justify-center flex-grow">
        <div className="bg-white rounded-3xl p-5 shadow-lg mb-4">
          <ChatIcon className="w-16 h-16 text-blue-500" />
        </div>
        <h1 className="text-5xl font-bold text-gray-800">MiniChat</h1>
        <p className="mt-2 text-lg text-gray-700">Chat. Share. Connect.</p>
      </div>
      <div className="w-full p-8">
        <p className="text-center text-gray-600 mb-2">Checking status...</p>
        <div className="w-full bg-white/30 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full w-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
