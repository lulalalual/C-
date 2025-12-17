import { UserProfile, AIConfig, MistakeRecord, UserHistoryItem } from '../types';

const USERS_STORAGE_KEY = 'cpp_master_users';
const CURRENT_USER_KEY = 'cpp_master_current_user';

interface UserDatabase {
  [username: string]: {
    passwordHash: string; // In a real app, hash this. Here we store plain for simplicity/mock.
    profile: UserProfile;
  }
}

// Helpers
const getDb = (): UserDatabase => {
  const data = localStorage.getItem(USERS_STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

const saveDb = (db: UserDatabase) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(db));
};

export const userService = {
  // Login or Register if not exists (Simplified Flow)
  login: (username: string, password: string): boolean => {
    const db = getDb();
    
    if (db[username]) {
      // Login: check password
      if (db[username].passwordHash === password) {
        localStorage.setItem(CURRENT_USER_KEY, username);
        return true;
      }
      return false;
    } else {
      // Register new user
      db[username] = {
        passwordHash: password,
        profile: {
          username,
          aiConfig: null,
          history: [],
          mistakes: []
        }
      };
      saveDb(db);
      localStorage.setItem(CURRENT_USER_KEY, username);
      return true;
    }
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): UserProfile | null => {
    const username = localStorage.getItem(CURRENT_USER_KEY);
    if (!username) return null;
    const db = getDb();
    return db[username]?.profile || null;
  },

  updateAIConfig: (config: AIConfig) => {
    const username = localStorage.getItem(CURRENT_USER_KEY);
    if (!username) return;
    const db = getDb();
    if (db[username]) {
      db[username].profile.aiConfig = config;
      saveDb(db);
    }
  },

  addMistake: (mistake: MistakeRecord) => {
    const username = localStorage.getItem(CURRENT_USER_KEY);
    if (!username) return;
    const db = getDb();
    if (db[username]) {
      // Avoid duplicates based on question ID text
      const exists = db[username].profile.mistakes.some(m => m.question.text === mistake.question.text);
      if (!exists) {
        db[username].profile.mistakes.unshift(mistake); // Add to top
        saveDb(db);
      }
    }
  },

  removeMistake: (mistakeId: string) => {
    const username = localStorage.getItem(CURRENT_USER_KEY);
    if (!username) return;
    const db = getDb();
    if (db[username]) {
      db[username].profile.mistakes = db[username].profile.mistakes.filter(m => m.id !== mistakeId);
      saveDb(db);
    }
  },

  addHistory: (item: UserHistoryItem) => {
    const username = localStorage.getItem(CURRENT_USER_KEY);
    if (!username) return;
    const db = getDb();
    if (db[username]) {
      db[username].profile.history.push(item);
      saveDb(db);
    }
  }
};