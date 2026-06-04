import { Platform } from 'react-native';

const LEADERBOARD_KEY_PREFIX = 'arcade_leaderboard_v3_';

// Start empty so only real players score
const defaultLeaderboard = [];

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
  if (streak <= 0) return false;
  const board = getLeaderboard(gameType);
  if (board.length < 5) return true;
  // Compare with the 5th (last) entry on the leaderboard
  return streak > board[board.length - 1].streak;
};

export const addHighScore = (name, streak, gameType = 'translation') => {
  const board = getLeaderboard(gameType);
  const today = new Date();
  const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
  
  const newEntry = {
    name: name.trim() ? name.trim().slice(0, 12) : 'ANONYME', // Max 12 characters
    streak: streak,
    date: dateStr
  };
  
  const newBoard = [...board, newEntry]
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 5); // Keep top 5
    
  if (Platform.OS === 'web') {
    try {
      const key = `${LEADERBOARD_KEY_PREFIX}${gameType}`;
      localStorage.setItem(key, JSON.stringify(newBoard));
    } catch (e) {}
  }
  
  return newBoard;
};

export const clearLeaderboard = (gameType = 'translation') => {
  if (Platform.OS === 'web') {
    try {
      const key = `${LEADERBOARD_KEY_PREFIX}${gameType}`;
      localStorage.setItem(key, JSON.stringify(defaultLeaderboard));
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
