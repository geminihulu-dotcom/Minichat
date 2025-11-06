import React, { useState, useRef, useEffect } from 'react';
import { Message, User, Chat } from '../types';
import { BackIcon, MoreVertIcon, AttachmentIcon, EmojiIcon, SendIcon, PhotoIcon } from '../constants';
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ChatScreenProps {
  chatId: string;
  currentUser: User;
  onBack: () => void;
}

const MessageBubble: React.FC<{ message: Message, currentUser: User, partner?: User | null }> = ({ message, currentUser, partner }) => {
  const isCurrentUser = message.senderId === currentUser.id;
  const user = isCurrentUser ? currentUser : partner;

  const formatTimestamp = (date: Timestamp) => {
    if (!date) return '';
    return date.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex items-end gap-2 ${isCurrentUser ? 'self-end' : 'self-start'}`}>
      {!isCurrentUser && <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-full mb-1 object-cover" />}
      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-2 rounded-xl max-w-xs lg:max-w-md ${isCurrentUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
          {message.imageUrl && <img src={message.imageUrl} alt="attachment" className="rounded-lg mb-2 max-w-full h-auto" />}
          {message.text && <p className="whitespace-pre-wrap break-words">{message.text}</p>}
        </div>
        <div className="flex items-center gap-1 mt-1">
          <p className="text-xs text-gray-400">{formatTimestamp(message.createdAt)}</p>
          {message.imageUrl && !message.text && <PhotoIcon className="w-4 h-4 text-gray-400" />}
        </div>
      </div>
    </div>
  );
};


const ChatScreen: React.FC<ChatScreenProps> = ({ chatId, currentUser, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatPartner, setChatPartner] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch chat partner details
    const fetchChatDetails = async () => {
        const chatDocRef = doc(db, 'chats', chatId);
        const chatDocSnap = await getDoc(chatDocRef);
        if (chatDocSnap.exists()) {
            const chatData = chatDocSnap.data() as Chat;
            const partnerId = chatData.members.find(id => id !== currentUser.id);
            if(partnerId) {
                const userDocRef = doc(db, 'users', partnerId);
                const userDocSnap = await getDoc(userDocRef);
                if(userDocSnap.exists()) {
                    setChatPartner(userDocSnap.data() as User);
                }
            }
        }
    }
    fetchChatDetails();

    // Subscribe to messages
    const messagesQuery = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [chatId, currentUser.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = async (text: string, imageUrl?: string) => {
    if (!text.trim() && !imageUrl) return;

    const messageData: Partial<Message> = {
      senderId: currentUser.id,
      createdAt: Timestamp.now(),
      ...(text.trim() && { text: text.trim() }),
      ...(imageUrl && { imageUrl }),
    };

    // Add new message to subcollection
    await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);

    // Update last message on chat document
    const chatDocRef = doc(db, 'chats', chatId);
    await updateDoc(chatDocRef, {
        lastMessage: {
            text: imageUrl ? '📷 Image' : text,
            createdAt: messageData.createdAt,
            senderId: currentUser.id,
        },
        updatedAt: messageData.createdAt,
    });
    
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(newMessage);
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
        const storageRef = ref(storage, `chat-media/${chatId}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        handleSendMessage('Image', downloadURL);
    } catch (error) {
        console.error("Error uploading file: ", error);
    }
    
    if(event.target) event.target.value = '';
  };


  return (
    <div className="flex flex-col h-full bg-gray-50">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <header className="flex items-center p-3 border-b bg-white shadow-sm z-10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
          <BackIcon className="w-6 h-6 text-gray-700" />
        </button>
        <img src={chatPartner?.avatar} alt={chatPartner?.name} className="w-10 h-10 rounded-full ml-2 object-cover" />
        <div className="ml-3">
          <h2 className="font-semibold text-gray-800">{chatPartner?.name || 'Loading...'}</h2>
        </div>
        <div className="flex-grow" />
        <button className="p-2 rounded-full hover:bg-gray-100">
          <MoreVertIcon className="w-6 h-6 text-gray-700" />
        </button>
      </header>

      <main className="flex-grow p-4 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} currentUser={currentUser} partner={chatPartner} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="p-3 bg-white border-t">
        <div className="flex items-center bg-gray-100 rounded-full px-2 py-1">
          <button onClick={handleAttachmentClick} className="p-2 rounded-full hover:bg-gray-200">
            <AttachmentIcon className="w-6 h-6 text-gray-500" />
          </button>
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-grow bg-transparent px-3 focus:outline-none text-gray-800"
          />
          <button className="p-2 rounded-full hover:bg-gray-200">
            <EmojiIcon className="w-6 h-6 text-gray-600" />
          </button>
          <button
            onClick={() => handleSendMessage(newMessage)}
            disabled={!newMessage.trim()}
            className="p-3 bg-blue-600 text-white rounded-full disabled:bg-gray-300 transition-colors"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ChatScreen;
