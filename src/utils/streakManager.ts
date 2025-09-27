interface StreakData {
  currentStreak: number;
  lastActivityDate: string;
  longestStreak: number;
  totalActivities: number;
}

export const updateStreak = (): StreakData => {
  const today = new Date().toISOString().split('T')[0];
  const savedStreak = localStorage.getItem('mindcare_streak_data');
  
  let streakData: StreakData = {
    currentStreak: 1,
    lastActivityDate: today,
    longestStreak: 1,
    totalActivities: 1
  };

  if (savedStreak) {
    const existing = JSON.parse(savedStreak);
    const lastDate = new Date(existing.lastActivityDate);
    const todayDate = new Date(today);
    const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Same day, don't increment streak but count activity
      streakData = {
        ...existing,
        totalActivities: existing.totalActivities + 1
      };
    } else if (daysDiff === 1) {
      // Consecutive day, increment streak
      const newStreak = existing.currentStreak + 1;
      streakData = {
        currentStreak: newStreak,
        lastActivityDate: today,
        longestStreak: Math.max(existing.longestStreak, newStreak),
        totalActivities: existing.totalActivities + 1
      };
    } else {
      // Gap in days, reset streak
      streakData = {
        currentStreak: 1,
        lastActivityDate: today,
        longestStreak: existing.longestStreak,
        totalActivities: existing.totalActivities + 1
      };
    }
  }

  localStorage.setItem('mindcare_streak_data', JSON.stringify(streakData));
  return streakData;
};

export const getStreakData = (): StreakData => {
  const saved = localStorage.getItem('mindcare_streak_data');
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    currentStreak: 0,
    lastActivityDate: '',
    longestStreak: 0,
    totalActivities: 0
  };
};