import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import type { ChatSession, Prompt } from '../types';

export const useFirestore = (userId: string | undefined) => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [customPrompts, setCustomPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    if (!userId) {
      setChatSessions([]);
      setCustomPrompts([]);
      return;
    }

    // Subscribe to chat sessions
    const sessionsRef = collection(db, 'users', userId, 'chatSessions');
    const sessionsQuery = query(sessionsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribeSessions = onSnapshot(sessionsQuery, (snapshot) => {
      const sessions = snapshot.docs.map(doc => doc.data() as ChatSession);
      setChatSessions(sessions);
    }, (error) => {
      console.error("Error fetching sessions:", error);
    });

    // Subscribe to custom prompts
    const promptsRef = collection(db, 'users', userId, 'prompts');
    const unsubscribePrompts = onSnapshot(promptsRef, (snapshot) => {
      const prompts = snapshot.docs.map(doc => doc.data() as Prompt);
      setCustomPrompts(prompts);
    }, (error) => {
      console.error("Error fetching prompts:", error);
    });

    return () => {
      unsubscribeSessions();
      unsubscribePrompts();
    };
  }, [userId]);

  const saveChatSession = async (userId: string, session: ChatSession) => {
    try {
      const docRef = doc(db, 'users', userId, 'chatSessions', session.id);
      await setDoc(docRef, session);
    } catch (error) {
      console.error("Error saving chat session:", error);
    }
  };

  const saveCustomPrompt = async (userId: string, prompt: Prompt) => {
    try {
      const docRef = doc(db, 'users', userId, 'prompts', prompt.id);
      await setDoc(docRef, prompt);
    } catch (error) {
      console.error("Error saving custom prompt:", error);
    }
  };

  const deleteChatSession = async (userId: string, sessionId: string) => {
    try {
      const docRef = doc(db, 'users', userId, 'chatSessions', sessionId);
      await deleteDoc(docRef);
    } catch (error) {
       console.error("Error deleting chat session:", error);
    }
  };

  return { chatSessions, customPrompts, saveChatSession, saveCustomPrompt, deleteChatSession, setChatSessions };
};
