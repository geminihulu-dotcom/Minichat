import React, { useState, useEffect } from 'react';
import { Screen, User } from './types';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import ChatListScreen from './components/ChatListScreen';
import ChatScreen from './components/ChatScreen';
import ProfileScreen from './components/ProfileScreen';
import NewChatScreen from './components/NewChatScreen';
import NotificationsScreen from './components/NotificationsScreen';
import PrivacyScreen from './components/PrivacyScreen';
import { auth, db } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';


const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>(Screen.SPLASH);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in, fetch their profile from Firestore.
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if(userDocSnap.exists()) {
          setCurrentUser(userDocSnap.data() as User);
          setScreen(Screen.CHAT_LIST);
        } else {
          // This case might happen if the user doc creation fails after signup.
          // For now, we log out the user.
          auth.signOut();
        }
      } else {
        // User is signed out.
        setCurrentUser(null);
        setScreen(Screen.LOGIN);
      }
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);
  
  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setScreen(Screen.CHAT);
  };
  
  const handleBackToChatList = () => {
    setSelectedChatId(null);
    setScreen(Screen.CHAT_LIST);
  }

  const renderScreen = () => {
    if (!authChecked) {
      return <SplashScreen onAnimationEnd={() => {}} />;
    }

    switch (screen) {
      case Screen.SPLASH:
        return <SplashScreen onAnimationEnd={() => setScreen(Screen.LOGIN)} />;
      case Screen.LOGIN:
        return <LoginScreen />;
      case Screen.CHAT_LIST:
        if (currentUser) {
            return <ChatListScreen 
              currentUser={currentUser} 
              onSelectChat={handleSelectChat} 
              onNavigateToProfile={() => setScreen(Screen.PROFILE)} 
              onNewChat={() => setScreen(Screen.NEW_CHAT)} 
            />;
        }
        return <LoginScreen />;
      case Screen.CHAT:
        if (currentUser && selectedChatId) {
            return <ChatScreen 
                chatId={selectedChatId}
                currentUser={currentUser} 
                onBack={handleBackToChatList} 
            />;
        }
        handleBackToChatList();
        return null;
      case Screen.PROFILE:
        if (currentUser) {
            return <ProfileScreen 
              user={currentUser} 
              onBack={() => setScreen(Screen.CHAT_LIST)} 
              onNavigateToNotifications={() => setScreen(Screen.NOTIFICATIONS)}
              onNavigateToPrivacy={() => setScreen(Screen.PRIVACY)}
            />;
        }
        return <LoginScreen />;
      case Screen.NEW_CHAT:
        if (currentUser) {
          return <NewChatScreen 
            currentUser={currentUser}
            onChatStarted={(chatId) => {
              setSelectedChatId(chatId);
              setScreen(Screen.CHAT);
            }}
            onBack={() => setScreen(Screen.CHAT_LIST)}
          />
        }
        return <LoginScreen />;
      case Screen.NOTIFICATIONS:
        return <NotificationsScreen onBack={() => setScreen(Screen.PROFILE)} />;
      case Screen.PRIVACY:
        return <PrivacyScreen onBack={() => setScreen(Screen.PROFILE)} />;
      default:
        return <LoginScreen />;
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-200 p-4">
      <div className="w-full max-w-md h-full max-h-[850px] bg-white rounded-3xl shadow-2xl overflow-hidden relative">
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;
