import React, { useRef } from 'react';
import { User } from '@/types';
import { BackIcon, LogoutIcon, NotificationIcon, PrivacyIcon, HelpIcon, EditIcon } from '@/constants';
import { auth, db, storage } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ProfileScreenProps {
  user: User;
  onBack: () => void;
  onNavigateToNotifications: () => void;
  onNavigateToPrivacy: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onBack, onNavigateToNotifications, onNavigateToPrivacy }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ProfileOption: React.FC<{icon: React.ReactNode, label: string, onClick?: () => void, className?: string}> = ({ icon, label, onClick, className = '' }) => (
    <button onClick={onClick} className={`flex items-center p-4 w-full text-left hover:bg-gray-50 rounded-lg ${className}`}>
      <div className="mr-4 text-gray-500">{icon}</div>
      <span className="text-gray-800 text-lg">{label}</span>
    </button>
  );
  
  const handleLogout = () => {
    signOut(auth);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const storageRef = ref(storage, `avatars/${user.id}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      const userDocRef = doc(db, 'users', user.id);
      await updateDoc(userDocRef, { avatar: downloadURL });

    } catch (error) {
      console.error("Error uploading avatar: ", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <header className="flex items-center p-4 bg-white border-b">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
          <BackIcon className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800 ml-4">Profile</h1>
      </header>

      <main className="flex-grow p-6 flex flex-col items-center">
        <div className="relative mb-6">
          <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-full shadow-lg border-4 border-white object-cover" />
          <button onClick={handleAvatarClick} className="absolute bottom-1 right-1 bg-blue-600 p-2 rounded-full text-white hover:bg-blue-700 transition-transform hover:scale-110 shadow-md">
            <EditIcon className="w-5 h-5"/>
          </button>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
        <p className="text-gray-500 mt-1">{user.email}</p>

        <div className="w-full bg-white rounded-xl shadow-md mt-8">
            <ProfileOption icon={<NotificationIcon className="w-6 h-6" />} label="Notifications" onClick={onNavigateToNotifications} />
            <hr className="mx-4"/>
            <ProfileOption icon={<PrivacyIcon className="w-6 h-6" />} label="Privacy" onClick={onNavigateToPrivacy} />
            <hr className="mx-4"/>
            <ProfileOption icon={<HelpIcon className="w-6 h-6" />} label="Help" />
        </div>
        
        <div className="w-full bg-white rounded-xl shadow-md mt-6">
          <ProfileOption 
            icon={<LogoutIcon className="w-6 h-6" />} 
            label="Log Out" 
            onClick={handleLogout}
            className="text-red-500 hover:bg-red-50 font-semibold"
          />
        </div>
      </main>
    </div>
  );
};

export default ProfileScreen;
