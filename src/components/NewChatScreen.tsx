import React, { useState, useEffect } from 'react';
import { User, Chat } from '@/types';
import { BackIcon } from '@/constants';
import { db } from '@/firebase';
import { collection, getDocs, addDoc, query, where, serverTimestamp, limit, orderBy } from 'firebase/firestore';

interface NewChatScreenProps {
  currentUser: User;
  onChatStarted: (chatId: string) => void;
  onBack: () => void;
}

const NewChatScreen: React.FC<NewChatScreenProps> = ({ currentUser, onChatStarted, onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersQuery = query(
        collection(db, 'users'),
        where('id', '!=', currentUser.id),
        orderBy('id'),
        limit(30)
      );
      const usersSnapshot = await getDocs(usersQuery);
      const allUsers = usersSnapshot.docs.map(doc => doc.data() as User);
      setUsers(allUsers);
      setLoading(false);
    };

    fetchUsers();
  }, [currentUser.id]);

  const handleStartChat = async (userId: string) => {
    const chatsQuery = query(
      collection(db, 'chats'), 
      where('members', '==', [currentUser.id, userId])
    );
    const querySnapshot = await getDocs(chatsQuery);

    if (!querySnapshot.empty) {
      const existingChat = querySnapshot.docs[0];
      onChatStarted(existingChat.id);
      return;
    }

    const newChatRef = await addDoc(collection(db, 'chats'), {
      members: [currentUser.id, userId],
      updatedAt: serverTimestamp(),
      lastMessage: null,
      isGroup: false,
    });
    onChatStarted(newChatRef.id);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="flex items-center p-4 bg-gray-50 border-b border-gray-200">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
          <BackIcon className="w-6 h-6 text-gray-700" />
        </button>
        <div className="ml-4">
          <h1 className="text-xl font-semibold text-gray-800">New Chat</h1>
          <p className="text-sm text-gray-500">Select a contact</p>
        </div>
      </header>
      
      <main className="flex-grow overflow-y-auto">
        {loading ? (
            <div className="flex justify-center items-center h-full text-gray-500"><p>Loading contacts...</p></div>
        ) : users.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            <p>No new contacts available.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 p-2">
            {users.map(user => (
              <li
                key={user.id}
                onClick={() => handleStartChat(user.id)}
                className="flex items-center p-3 hover:bg-gray-100 cursor-pointer transition-colors duration-200 rounded-lg"
              >
                <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full mr-4 object-cover" />
                <div>
                  <h3 className="font-semibold text-gray-800">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default NewChatScreen;
