import { SavedSession } from "../types";

const STORAGE_KEY = 'resume_sessions';

export const saveSession = (session: SavedSession) => {
  try {
    const existing = getSessions();
    // Update if exists, otherwise add
    const index = existing.findIndex(s => s.id === session.id);
    if (index >= 0) {
      existing[index] = session;
    } else {
      existing.unshift(session); // Add to top
    }
    // Limit to 10 saved sessions
    const trimmed = existing.slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error("Failed to save session", error);
  }
};

export const getSessions = (): SavedSession[] => {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error("Failed to load sessions", error);
    return [];
  }
};

export const deleteSession = (id: string) => {
  try {
    const existing = getSessions();
    const updated = existing.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to delete session", error);
  }
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};