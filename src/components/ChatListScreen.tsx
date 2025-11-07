
import React, { useState, useEffect, useMemo } from 'react';
import { Chat, User } from '@/types';
import { SettingsIcon, SearchIcon, PlusIcon } from '@/constants';
import { db } from '@/firebase';
import { collection, query, where, onSnapshot, getDocs, Timestamp } from 'firebase/firestore';

interface ChatListScreenProps {
  currentUser: User;
  onSelectChat: (chat: Chat) => void;
  onNavigateToProfile: () => void;
  onNewChat: () => void;
}

export interface ChatWithParticipant extends Chat {
  participant?: User;
}

const ChatListItem: React.FC<{ chat: ChatWithParticipant; onSelectChat: (chat: Chat) => void }> = ({ chat, onSelectChat }) => {
  const lastMessage = chat.lastMessage;
  const user = chat.isGroup ? { name: chat.groupName, avatar: chat.groupAvatar } : chat.participant;
  
  const formatTimestamp = (date: any | undefined) => {
    if (!date) return '';
    const jsDate = date instanceof Timestamp ? date.toDate() : new Date(date);
    return jsDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <li
      onClick={() => onSelectChat(chat)}
      className="flex items-center p-3 hover:bg-gray-100 cursor-pointer transition-colors duration-200 rounded-lg"
    >
      <img src={user?.avatar} alt={user?.name} className="w-14 h-14 rounded-full mr-4 object-cover" />
      <div className="flex-grow">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">{user?.name || '...'}</h3>
          <p className="text-xs text-gray-500">{formatTimestamp(chat.updatedAt)}</p>
        </div>
        <div className="flex justify-between items-start">
          <p className="text-sm text-gray-600 truncate max-w-[200px]">{lastMessage?.text || 'No messages yet'}</p>
        </div>
      </div>
    </li>
  );
};

const ChatListScreen: React.FC<ChatListScreenProps> = ({ currentUser, onSelectChat, onNavigateToProfile, onNewChat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [rawChats, setRawChats] = useState<Chat[]>([]);
  const [usersMap, setUsersMap] = useState<Map<string, User>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.id) return;

    const chatsQuery = query(
      collection(db, 'chats'),
      where('members', 'array-contains', currentUser.id)
    );

    const unsubscribe = onSnapshot(chatsQuery, (querySnapshot) => {
      const chatsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat));
      
      chatsData.sort((a, b) => {
        const dateA = a.updatedAt?.toDate ? a.updatedAt.toDate() : new Date(0);
        const dateB = b.updatedAt?.toDate ? b.updatedAt.toDate() : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setRawChats(chatsData);
    }, (error) => {
      console.error("Error fetching chats: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser.id]);

  useEffect(() => {
    const userIds = [...new Set(rawChats.flatMap(chat => chat.members))];
    const usersToFetch = userIds.filter(id => !usersMap.has(id));

    if (usersToFetch.length === 0) {
      if (loading) setLoading(false);
      return;
    }

    const usersQuery = query(collection(db, 'users'), where('id', 'in', usersToFetch));
    
    getDocs(usersQuery).then(usersSnapshot => {
      setUsersMap(prevMap => {
        const newMap = new Map(prevMap);
        usersSnapshot.docs.forEach(doc => {
          newMap.set(doc.id, doc.data() as User);
        });
        return newMap;
      });
      if (loading) setLoading(false);
    }).catch(error => {
        console.error("Error fetching user data: ", error);
        setLoading(false);
    });
  }, [rawChats, usersMap, loading]);

  const chats = useMemo(() => {
    return rawChats.map(chat => {
      if (chat.isGroup) {
        return chat;
      }
      const participantId = chat.members.find(id => id !== currentUser.id);
      const participant = participantId ? usersMap.get(participantId) : undefined;
      return { ...chat, participant };
    });
  }, [rawChats, usersMap, currentUser.id]);

  const filteredChats = chats.filter(chat => {
    const participantName = chat.isGroup ? chat.groupName : chat.participant?.name;
    return participantName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Chats</h1>
          <button onClick={onNavigateToProfile} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <SettingsIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages or users"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </header>
      
      <main className="flex-grow overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full"><p>Loading chats...</p></div>
        ) : chats.length === 0 ? (
          <div className="flex justify-center items-center h-full text-center p-4">
            <p className="text-gray-500">No chats yet. <br/> Tap the '+' button to start a conversation.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 p-2">
            {filteredChats.map(chat => (
              <ChatListItem key={chat.id} chat={chat} onSelectChat={onSelectChat} />
            ))}
          </ul>
        )}
      </main>

      <button 
        onClick={onNewChat}
        className="absolute bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-transform hover:scale-105"
      >
        <PlusIcon className="w-8 h-8"/>
      </button>
    </div>
  );
};

export default ChatListScreen;
