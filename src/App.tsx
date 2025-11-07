import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { User, Chat } from '@/types';
import SplashScreen from '@/components/SplashScreen';
import LoginScreen from '@/components/LoginScreen';
import ChatListScreen from '@/components/ChatListScreen';
import ChatScreen from '@/components/ChatScreen';
import ProfileScreen from '@/components/ProfileScreen';
import NotificationsScreen from '@/components/NotificationsScreen';
import PrivacyScreen from '@/components/PrivacyScreen';
import NewChatScreen from '@/components/NewChatScreen';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [splashing, setSplashing] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('list'); // list, chat, profile, notifications, privacy, newChat
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() } as User);
        } else {
          const newUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Anonymous',
            email: firebaseUser.email || '',
            avatar: firebaseUser.photoURL || 'https://i.pravatar.cc/150?u=a042581f4e29026704d'
          };
          await setDoc(userDocRef, newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSplashing(false), 2000); // Minimum splash time
    return () => clearTimeout(timer);
  }, []);

  if (loading || splashing) {
    return <SplashScreen />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  const navigateToChat = (chat: Chat) => {
    setSelectedChat(chat);
    setCurrentScreen('chat');
  };
  
  const handleChatStarted = async (chatId: string) => {
    const chatDocRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatDocRef);
    if (chatDoc.exists()) {
        const chat = { id: chatDoc.id, ...chatDoc.data() } as Chat;
        navigateToChat(chat);
    }
  };

  const navigateToProfile = () => setCurrentScreen('profile');
  const navigateToNotifications = () => setCurrentScreen('notifications');
  const navigateToPrivacy = () => setCurrentScreen('privacy');
  const navigateToNewChat = () => setCurrentScreen('newChat');
  const backToList = () => setCurrentScreen('list');

  return (
    <div className="h-screen bg-gray-100">
      {currentScreen === 'list' && <ChatListScreen currentUser={user} onSelectChat={navigateToChat} onNavigateToProfile={navigateToProfile} onNewChat={navigateToNewChat}/>}
      {currentScreen === 'chat' && selectedChat && <ChatScreen chat={selectedChat} user={user} onBack={backToList} />}
      {currentScreen === 'profile' && <ProfileScreen user={user} onBack={backToList} onNavigateToNotifications={navigateToNotifications} onNavigateToPrivacy={navigateToPrivacy} />}
      {currentScreen === 'notifications' && <NotificationsScreen onBack={navigateToProfile} />}
      {currentScreen === 'privacy' && <PrivacyScreen onBack={navigateToProfile} />}
      {currentScreen === 'newChat' && <NewChatScreen currentUser={user} onBack={backToList} onChatStarted={handleChatStarted} />}
    </div>
  );
};

export default App;
