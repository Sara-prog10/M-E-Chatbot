import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc,
  or
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

    // Subscribe to custom prompts (fetch public OR authored by user)
    const promptsRef = collection(db, 'prompts');
    const promptsQuery = query(
      promptsRef,
      or(where('userId', '==', userId), where('isPublic', '==', true))
    );

    const unsubscribePrompts = onSnapshot(promptsQuery, (snapshot) => {
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

  const saveCustomPrompt = async (prompt: Prompt) => {
    try {
      // Save root level rather than nested under user to allow sharing
      const docRef = doc(db, 'prompts', prompt.id);
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

  const toggleFavoritePrompt = async (userId: string, prompt: Prompt) => {
    try {
      const favoritedBy = prompt.favoritedBy || [];
      const hasFavorited = favoritedBy.includes(userId);
      let newFavoritedBy: string[];
      let newFavoritesCount = prompt.favoritesCount || 0;

      if (hasFavorited) {
        newFavoritedBy = favoritedBy.filter(id => id !== userId);
        newFavoritesCount = Math.max(0, newFavoritesCount - 1);
      } else {
        newFavoritedBy = [...favoritedBy, userId];
        newFavoritesCount++;
      }

      await saveCustomPrompt({
        ...prompt,
        favoritedBy: newFavoritedBy,
        favoritesCount: newFavoritesCount
      });
    } catch (error) {
      console.error("Error toggling favorite on prompt:", error);
    }
  };

  return { chatSessions, customPrompts, saveChatSession, saveCustomPrompt, deleteChatSession, toggleFavoritePrompt, setChatSessions };
};
