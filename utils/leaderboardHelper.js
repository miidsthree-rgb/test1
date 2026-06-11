import { Platform } from 'react-native';

const LEADERBOARD_KEY_PREFIX = 'arcade_leaderboard_v3_';
const APP_KEY = 'i6ezx7n2'; // Unique AppKey on keyvalue.immanuel.co

// Start empty so only real players score
const defaultLeaderboard = [];

// Helper: base64 url-safe encoding (handles accents correctly)
const base64UrlEncode = (str) => {
  try {
    const utf8BtoA = (s) => {
      return btoa(encodeURIComponent(s).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));
    };
    return utf8BtoA(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (e) {
    return '';
  }
};

// Helper: base64 url-safe decoding
const base64UrlDecode = (str) => {
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const utf8AtoB = (s) => {
      return decodeURIComponent(Array.prototype.map.call(atob(s), (c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
    };
    return utf8AtoB(base64);
  } catch (e) {
    return '[]';
  }
};

export const fetchGlobalLeaderboard = async (gameType = 'translation') => {
  if (Platform.OS === 'web') {
    try {
      const response = await fetch(`https://keyvalue.immanuel.co/api/KeyVal/GetValue/${APP_KEY}/${gameType}_leaderboard?t=${Date.now()}`);
      if (response.ok) {
        const text = await response.text();
        const cleanedText = text.replace(/"/g, '').trim(); // Remove surrounding quotes
        if (cleanedText) {
          const decoded = base64UrlDecode(cleanedText);
          const parsed = JSON.parse(decoded);
          if (Array.isArray(parsed)) {
            const key = `${LEADERBOARD_KEY_PREFIX}${gameType}`;
            localStorage.setItem(key, JSON.stringify(parsed));
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to fetch global leaderboard:', e);
    }
  }
  return null;
};

export const uploadLeaderboard = async (gameType, board) => {
  if (Platform.OS === 'web') {
    try {
      const str = JSON.stringify(board);
      const encoded = base64UrlEncode(str);
      const url = `https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${APP_KEY}/${gameType}_leaderboard/${encoded}`;
      await fetch(url, { 
        method: 'POST',
        body: ''
      });
    } catch (e) {
      console.warn('Failed to upload global leaderboard:', e);
    }
  }
};

const syncAndUploadHighScore = async (newEntry, gameType, force = false) => {
  try {
    const globalBoard = await fetchGlobalLeaderboard(gameType);
    const boardToUse = globalBoard || getLeaderboard(gameType);
    
    // Check if there is an existing entry with the same name (case-insensitive)
    const existingIndex = boardToUse.findIndex(entry => 
      (entry.name || '').toLowerCase() === (newEntry.name || '').toLowerCase()
    );
    
    let mergedBoard = [...boardToUse];
    if (existingIndex !== -1) {
      // If the new score is higher, or if we force it (developer cheat mode)
      if (force || Number(newEntry.streak) > Number(boardToUse[existingIndex].streak || 0)) {
        mergedBoard[existingIndex] = newEntry;
      }
    } else {
      mergedBoard.push(newEntry);
    }
    
    // Sort and keep top 10
    mergedBoard = mergedBoard
      .sort((a, b) => Number(b.streak) - Number(a.streak))
      .slice(0, 10);
      
    const key = `${LEADERBOARD_KEY_PREFIX}${gameType}`;
    localStorage.setItem(key, JSON.stringify(mergedBoard));
    await uploadLeaderboard(gameType, mergedBoard);
  } catch (e) {
    console.warn('Sync and upload failed:', e);
  }
};

export const getLeaderboard = (gameType = 'translation') => {
  if (Platform.OS === 'web') {
    try {
      const key = `${LEADERBOARD_KEY_PREFIX}${gameType}`;
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      } else {
        localStorage.setItem(key, JSON.stringify(defaultLeaderboard));
        return defaultLeaderboard;
      }
    } catch (e) {
      return defaultLeaderboard;
    }
  }
  return defaultLeaderboard;
};

export const checkHighScore = (streak, gameType = 'translation') => {
  if (Number(streak) <= 0) return false;
  const board = getLeaderboard(gameType);
  if (board.length < 10) return true;
  return Number(streak) > Number(board[board.length - 1].streak || 0);
};

export const addHighScore = async (name, streak, gameType = 'translation', force = false) => {
  const board = getLeaderboard(gameType);
  const today = new Date();
  const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
  
  const trimmedName = name.trim();
  const cleanName = trimmedName ? trimmedName.slice(0, 12) : 'ANONYME';
  
  const newEntry = {
    name: cleanName,
    streak: streak,
    date: dateStr
  };
  
  // Check if there is an existing entry with the same name (case-insensitive)
  const existingIndex = board.findIndex(entry => 
    (entry.name || '').toLowerCase() === cleanName.toLowerCase()
  );
  
  let newBoard = [...board];
  if (existingIndex !== -1) {
    // If the new score is higher, or if we force it (developer cheat mode)
    if (force || Number(streak) > Number(board[existingIndex].streak || 0)) {
      newBoard[existingIndex] = newEntry;
    }
  } else {
    newBoard.push(newEntry);
  }
  
  // Sort and keep top 10
  newBoard = newBoard
    .sort((a, b) => Number(b.streak) - Number(a.streak))
    .slice(0, 10);
    
  if (Platform.OS === 'web') {
    try {
      const key = `${LEADERBOARD_KEY_PREFIX}${gameType}`;
      localStorage.setItem(key, JSON.stringify(newBoard));
      await syncAndUploadHighScore(newEntry, gameType, force);
    } catch (e) {}
  }
  
  return newBoard;
};

export const clearLeaderboard = (gameType = 'translation') => {
  if (Platform.OS === 'web') {
    try {
      const key = `${LEADERBOARD_KEY_PREFIX}${gameType}`;
      localStorage.setItem(key, JSON.stringify(defaultLeaderboard));
      uploadLeaderboard(gameType, defaultLeaderboard);
    } catch (e) {}
  }
  return defaultLeaderboard;
};

export const getStats = () => {
  const defaultStats = {
    translationGames: 0,
    translationCorrect: 0,
    translationTotal: 0,
    translationMaxStreak: 0,
    questionGames: 0,
    questionCorrect: 0,
    questionTotal: 0,
    questionMaxStreak: 0,
  };
  if (Platform.OS === 'web') {
    try {
      const data = localStorage.getItem('arcade_stats_v3');
      if (data) return JSON.parse(data);
    } catch (e) {}
  }
  return defaultStats;
};

export const saveGameSession = (gameType, streak) => {
  const stats = getStats();
  if (gameType === 'translation') {
    stats.translationGames += 1;
    stats.translationCorrect += streak;
    stats.translationTotal += (streak + 1);
    if (streak > stats.translationMaxStreak) {
      stats.translationMaxStreak = streak;
    }
  } else if (gameType === 'question') {
    stats.questionGames += 1;
    stats.questionCorrect += streak;
    stats.questionTotal += (streak + 1);
    if (streak > stats.questionMaxStreak) {
      stats.questionMaxStreak = streak;
    }
  }
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem('arcade_stats_v3', JSON.stringify(stats));
    } catch (e) {}
  }
  return stats;
};

export const clearStats = () => {
  const cleared = {
    translationGames: 0,
    translationCorrect: 0,
    translationTotal: 0,
    translationMaxStreak: 0,
    questionGames: 0,
    questionCorrect: 0,
    questionTotal: 0,
    questionMaxStreak: 0,
  };
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem('arcade_stats_v3', JSON.stringify(cleared));
    } catch (e) {}
  }
  return cleared;
};

export const getCoins = () => {
  if (Platform.OS === 'web') {
    try {
      const data = localStorage.getItem('arcade_coins_v3');
      if (data) return parseInt(data, 10);
      localStorage.setItem('arcade_coins_v3', '50'); // Welcome gift
      return 50;
    } catch (e) {}
  }
  return 50;
};

export const addCoins = (amount) => {
  const current = getCoins();
  const updated = current + amount;
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem('arcade_coins_v3', updated.toString());
    } catch (e) {}
  }
  return updated;
};

export const spendCoins = (amount) => {
  const current = getCoins();
  if (current < amount) return false;
  const updated = current - amount;
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem('arcade_coins_v3', updated.toString());
    } catch (e) {}
  }
  return true;
};

export const hasExtraLifeUpgrade = () => {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem('arcade_upgrade_extra_life_v3') === 'true';
    } catch (e) {}
  }
  return false;
};

export const hasExtendedTimerUpgrade = () => {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem('arcade_upgrade_extended_timer_v3') === 'true';
    } catch (e) {}
  }
  return false;
};

export const hasDoubleCoinsUpgrade = () => {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem('arcade_upgrade_double_coins_v3') === 'true';
    } catch (e) {}
  }
  return false;
};

export const buyUpgrade = (upgradeId, cost) => {
  const currentCoins = getCoins();
  if (currentCoins < cost) return false;
  
  const success = spendCoins(cost);
  if (success) {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(`arcade_upgrade_${upgradeId}_v3`, 'true');
      } catch (e) {}
    }
    return true;
  }
  return false;
};

export const getValorantRank = (streak) => {
  if (streak >= 46) return { name: 'RADIANT', color: '#F59E0B' };
  if (streak >= 36) return { name: 'IMMORTEL', color: '#EF4444' };
  if (streak >= 28) return { name: 'ASCENDANT', color: '#10B981' };
  if (streak >= 21) return { name: 'DIAMANT', color: '#D946EF' };
  if (streak >= 15) return { name: 'PLATINE', color: '#06B6D4' };
  if (streak >= 10) return { name: 'OR', color: '#FBBF24' };
  if (streak >= 6) return { name: 'ARGENT', color: '#D1D5DB' };
  if (streak >= 3) return { name: 'BRONZE', color: '#B45309' };
  return { name: 'FER', color: '#9CA3AF' };
};

