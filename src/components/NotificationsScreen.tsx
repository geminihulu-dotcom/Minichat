import React from 'react';
import { BackIcon, NotificationIcon } from '@/constants';

interface NotificationsScreenProps {
  onBack: () => void;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col h-full bg-gray-100">
      <header className="flex items-center p-4 bg-white border-b">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
          <BackIcon className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800 ml-4">Notifications</h1>
      </header>
      <main className="flex-grow p-6 flex flex-col items-center justify-center text-center">
        <NotificationIcon className="w-24 h-24 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700">Notification Settings</h2>
        <p className="text-gray-500 mt-2">
          Configuration options for notifications will be available here.
        </p>
      </main>
    </div>
  );
};

export default NotificationsScreen;
