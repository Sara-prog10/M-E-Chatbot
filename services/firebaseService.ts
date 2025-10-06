import type { Prompt } from '../types';

const FIREBASE_URL = 'https://megpt-3822f-default-rtdb.firebaseio.com';

/**
 * Saves a new prompt to the Firebase Realtime Database.
 * @param {Omit<Prompt, 'id'>} promptData - The prompt data to save.
 * @returns {Promise<string>} The key of the newly created prompt.
 */
export async function savePrompt(promptData: Omit<Prompt, 'id'>): Promise<string> {
    const response = await fetch(`${FIREBASE_URL}/prompts.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(promptData),
    });

    if (!response.ok) {
        throw new Error('Failed to save prompt to Firebase.');
    }

    const data = await response.json();
    return data.name; // Firebase returns the key under the 'name' property
}

/**
 * Fetches all prompts from the Firebase Realtime Database.
 * @returns {Promise<Prompt[]>} An array of all prompts.
 */
export async function getPrompts(): Promise<Prompt[]> {
    const response = await fetch(`${FIREBASE_URL}/prompts.json`);
    
    if (!response.ok) {
        throw new Error('Failed to fetch prompts from Firebase.');
    }

    const data = await response.json();

    if (data) {
        // Convert the Firebase object of objects into an array
        return Object.keys(data).map(key => ({
            id: key,
            ...data[key],
        }));
    }

    return []; // Return empty array if no prompts exist
}

/**
 * Updates an existing prompt in the Firebase Realtime Database.
 * @param {string} promptId - The ID (key) of the prompt to update.
 * @param {Prompt} promptData - The new data for the prompt.
 * @returns {Promise<void>}
 */
export async function updatePrompt(promptId: string, promptData: Prompt): Promise<void> {
    // We don't need to store the id inside the object itself in Firebase
    const { id, ...dataToUpdate } = promptData;

    const response = await fetch(`${FIREBASE_URL}/prompts/${promptId}.json`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToUpdate),
    });

    if (!response.ok) {
        throw new Error('Failed to update prompt in Firebase.');
    }
}

/**
 * Fetches a user's favorite prompt IDs from Firebase.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<string[]>} A list of favorite prompt IDs.
 */
export async function getUserFavorites(userId: string): Promise<string[]> {
    const response = await fetch(`${FIREBASE_URL}/favorites/${userId}.json`);
    if (!response.ok) {
        throw new Error('Failed to fetch user favorites.');
    }
    const data = await response.json();
    return data ? Object.keys(data) : [];
}

/**
 * Adds a prompt to a user's favorites list in Firebase.
 * @param {string} userId - The ID of the user.
 * @param {string} promptId - The ID of the prompt to add.
 * @returns {Promise<void>}
 */
export async function addFavorite(userId: string, promptId: string): Promise<void> {
    const response = await fetch(`${FIREBASE_URL}/favorites/${userId}/${promptId}.json`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(true), // Store a simple boolean to mark as favorite
    });

    if (!response.ok) {
        throw new Error('Failed to add favorite.');
    }
}

/**
 * Removes a prompt from a user's favorites list in Firebase.
 * @param {string} userId - The ID of the user.
 * @param {string} promptId - The ID of the prompt to remove.
 * @returns {Promise<void>}
 */
export async function removeFavorite(userId: string, promptId: string): Promise<void> {
    const response = await fetch(`${FIREBASE_URL}/favorites/${userId}/${promptId}.json`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('Failed to remove favorite.');
    }
}

/**
 * Fetches all favorites across all users and calculates popularity counts.
 * @returns {Promise<Record<string, number>>} A map of promptId to its favorite count.
 */
export async function getAllFavorites(): Promise<Record<string, number>> {
    const response = await fetch(`${FIREBASE_URL}/favorites.json`);
    if (!response.ok) {
        throw new Error('Failed to fetch all favorites.');
    }
    const allUsersFavorites = await response.json();
    
    const counts: Record<string, number> = {};
    
    if (allUsersFavorites) {
        // allUsersFavorites is an object like { userId1: { promptId1: true }, userId2: { promptId1: true } }
        for (const userId in allUsersFavorites) {
            const userFavorites = allUsersFavorites[userId];
            for (const promptId in userFavorites) {
                counts[promptId] = (counts[promptId] || 0) + 1;
            }
        }
    }
    
    return counts;
}