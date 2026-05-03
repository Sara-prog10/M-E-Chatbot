import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc,
  deleteDoc,
  or,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db } from '../firebase';
import type { ChatSession, Prompt } from '../types';

export const useFirestore = (userId: string | undefined) => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [customPrompts, setCustomPrompts] = useState<Prompt[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!userId) {
      setChatSessions([]);
      setCustomPrompts([]);
      setIsAdmin(false);
      return;
    }

    // Check admin status
    const adminRef = doc(db, 'admins', userId);
    const unsubscribeAdmin = onSnapshot(adminRef, (doc) => {
      setIsAdmin(doc.exists() && (doc.data()?.role === 'admin' || doc.data()?.role === 'owner'));
    }, (error) => {
      console.error("Error fetching admin status:\n", error.message || error);
    });

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
      console.error("Error fetching prompts:\n", error.message || error);
    });

    return () => {
      unsubscribeSessions();
      unsubscribePrompts();
      unsubscribeAdmin();
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
      const docRef = doc(db, 'prompts', prompt.id);
      const favoritedBy = prompt.favoritedBy || [];
      const hasFavorited = favoritedBy.includes(userId);

      if (hasFavorited) {
        await updateDoc(docRef, {
          favoritedBy: arrayRemove(userId),
          favoritesCount: increment(-1)
        });
      } else {
        await updateDoc(docRef, {
          favoritedBy: arrayUnion(userId),
          favoritesCount: increment(1)
        });
      }
    } catch (error) {
      console.error("Error toggling favorite on prompt:", error);
    }
  };

  return { chatSessions, customPrompts, saveChatSession, saveCustomPrompt, deleteChatSession, toggleFavoritePrompt, setChatSessions, isAdmin };
};
