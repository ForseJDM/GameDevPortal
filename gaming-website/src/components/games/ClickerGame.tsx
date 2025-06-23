'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AchievementPopup from './AchievementPopup';
import useFavicon from '@/hooks/useFavicon';

// --- Type Definitions ---
// Moved to global.d.ts

type FlyingNumber = {
  id: number;
  value: number;
  x: number;
  y: number;
};

type AchievementID = 'CLICK_100' | 'CLICK_1000' | 'INVESTOR' | 'MANAGER';

type Achievement = {
  id: AchievementID;
  name: string;
  description: string;
  unlocked: boolean;
};

type PrestigeUpgradeID = 'MIGHTY_CLICK' | 'EFFICIENT_ASSISTANTS';

type PrestigeUpgrade = {
  id: PrestigeUpgradeID;
  name: string;
  description: (level: number) => string;
  level: number;
  cost: (level: number) => number;
};

const PRESTIGE_REQUIREMENT = 1000000;

const initialAchievements: Record<AchievementID, Achievement> = {
  CLICK_100: { id: 'CLICK_100', name: 'Новичок', description: 'Сделать 100 кликов', unlocked: false },
  CLICK_1000: { id: 'CLICK_1000', name: 'Мастер Клика', description: 'Сделать 1000 кликов', unlocked: false },
  INVESTOR: { id: 'INVESTOR', name: 'Инвестор', description: 'Купить 10 улучшений силы клика', unlocked: false },
  MANAGER: { id: 'MANAGER', name: 'Менеджер', description: 'Нанять 5 ассистентов', unlocked: false },
};

const initialPrestigeUpgrades: Record<PrestigeUpgradeID, PrestigeUpgrade> = {
  MIGHTY_CLICK: {
    id: 'MIGHTY_CLICK',
    name: 'Могучий Клик',
    description: (level) => `Увеличивает силу клика на ${level * 10}%.`,
    level: 0,
    cost: (level) => Math.floor(1 * Math.pow(2, level)),
  },
  EFFICIENT_ASSISTANTS: {
    id: 'EFFICIENT_ASSISTANTS',
    name: 'Эффективные Помощники',
    description: (level) => `Снижает стоимость помощников на ${level * 5}%.`,
    level: 0,
    cost: (level) => Math.floor(2 * Math.pow(3, level)),
  },
};

// --- Quest System ---
type QuestID = 'CLICKS' | 'EARN_SCORE' | 'BUY_UPGRADES';
type Quest = {
  id: string; // Unique instance ID
  questId: QuestID;
  description: string;
  goal: number;
  progress: number;
  reward: number; // For simplicity, reward is score for now
  isCompleted: boolean;
  isClaimed: boolean;
};

const allQuests: Record<QuestID, Omit<Quest, 'id' | 'progress' | 'isCompleted' | 'isClaimed'>> = {
  CLICKS: { questId: 'CLICKS', description: 'Сделать {goal} кликов', goal: 100, reward: 5000 },
  EARN_SCORE: { questId: 'EARN_SCORE', description: 'Заработать {goal} очков', goal: 10000, reward: 10000 },
  BUY_UPGRADES: { questId: 'BUY_UPGRADES', description: 'Купить {goal} любых улучшений', goal: 5, reward: 7500 },
};

const getNewDailyQuests = (): Quest[] => {
  const questKeys = Object.keys(allQuests) as QuestID[];
  const selectedQuests: Quest[] = [];
  // Select 3 unique random quests
  while (selectedQuests.length < 3 && questKeys.length > 0) {
    const randomIndex = Math.floor(Math.random() * questKeys.length);
    const questKey = questKeys.splice(randomIndex, 1)[0];
    const questTemplate = allQuests[questKey];
    selectedQuests.push({
      ...questTemplate,
      id: `${questKey}-${Date.now()}`,
      description: questTemplate.description.replace('{goal}', questTemplate.goal.toLocaleString()),
      progress: 0,
      isCompleted: false,
      isClaimed: false,
    });
  }
  return selectedQuests;
};

const ClickerGame = () => {
  const clickerFavicon = useMemo(() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="gold" stroke="orange" stroke-width="2"/><text x="16" y="22" font-size="18" text-anchor="middle" fill="#a26002" font-weight="bold" font-family="Arial">$</text></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }, []);
  useFavicon(clickerFavicon);

  // --- State Initialization ---
  // Initialize with default values, hydrate from localStorage in useEffect
  const [score, setScore] = useState(0);
  const [clickPower, setClickPower] = useState(1);
  const [autoClickRate, setAutoClickRate] = useState(0);
  const [assistants, setAssistants] = useState(0);
  const [clickMultiplier, setClickMultiplier] = useState(1);
  const [totalClicks, setTotalClicks] = useState(0);
  const [achievements, setAchievements] = useState(initialAchievements);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [prestigePoints, setPrestigePoints] = useState(0);
  const [prestigeUpgrades, setPrestigeUpgrades] = useState(initialPrestigeUpgrades);
  const [dailyQuests, setDailyQuests] = useState<Quest[]>([]);
  const [scoreSinceQuestLoad, setScoreSinceQuestLoad] = useState(0);
  const [flyingNumbers, setFlyingNumbers] = useState<FlyingNumber[]>([]);
  const [isClient, setIsClient] = useState(false);

  // --- Calculations ---
  const mightyClickBonus = useMemo(() => 1 + (prestigeUpgrades.MIGHTY_CLICK.level * 0.10), [prestigeUpgrades.MIGHTY_CLICK.level]);
  const efficientAssistantsBonus = useMemo(() => 1 - (prestigeUpgrades.EFFICIENT_ASSISTANTS.level * 0.05), [prestigeUpgrades.EFFICIENT_ASSISTANTS.level]);

  const prestigeBonus = useMemo(() => 1 + prestigePoints * 0.01, [prestigePoints]);

  const totalClickPower = useMemo(() => Math.floor((clickPower * clickMultiplier) * prestigeBonus * mightyClickBonus), [clickPower, clickMultiplier, prestigeBonus, mightyClickBonus]);
  const totalPassiveIncome = useMemo(() => (autoClickRate * 1 + assistants * 5) * prestigeBonus, [autoClickRate, assistants, prestigeBonus]);

  const assistantCost = useMemo(() => Math.floor(100 * Math.pow(1.15, assistants) * efficientAssistantsBonus), [assistants, efficientAssistantsBonus]);
  const clickPowerCost = useMemo(() => Math.floor(15 * Math.pow(1.15, clickPower - 1)), [clickPower]);
  const autoClickCost = Math.ceil(15 * Math.pow(1.8, autoClickRate));
  const multiplierCost = useMemo(() => Math.floor(500 * Math.pow(2, clickMultiplier -1)), [clickMultiplier]);

  // Client-side hydration from localStorage
  useEffect(() => {
    setIsClient(true);

    setScore(parseInt(localStorage.getItem('clickerScore') || '0', 10));
    setClickPower(parseInt(localStorage.getItem('clickerClickPower') || '1', 10));
    setAutoClickRate(parseInt(localStorage.getItem('clickerAutoClickRate') || '0', 10));
    setAssistants(parseInt(localStorage.getItem('clickerAssistants') || '0', 10));
    setClickMultiplier(parseInt(localStorage.getItem('clickerMultiplier') || '1', 10));
    setTotalClicks(parseInt(localStorage.getItem('totalClicks') || '0', 10));
    setAchievements(JSON.parse(localStorage.getItem('achievements') || JSON.stringify(initialAchievements)));
    setPrestigePoints(parseInt(localStorage.getItem('prestigePoints') || '0', 10));
    
    // Rehydrate prestige upgrades to restore functions
    const savedUpgrades = JSON.parse(localStorage.getItem('prestigeUpgrades') || '{}');
    const rehydratedUpgrades = { ...initialPrestigeUpgrades };
    for (const key in rehydratedUpgrades) {
      if (savedUpgrades[key]) {
        rehydratedUpgrades[key as PrestigeUpgradeID] = {
          ...rehydratedUpgrades[key as PrestigeUpgradeID],
          level: savedUpgrades[key].level,
        };
      }
    }
    setPrestigeUpgrades(rehydratedUpgrades);

    // Cheat codes for testing
    if (typeof window !== 'undefined') {
      window.addScore = (amount: number) => {
        setScore(prev => prev + amount);
      };
      window.addPrestige = (amount: number) => {
        setPrestigePoints(prev => prev + amount);
      };
      window.resetClickerGame = () => {
        console.log("--- RESETTING CLICKER GAME ---");
        const clickerKeys = [
          'clickerScore', 'clickerClickPower', 'clickerAutoClickRate',
          'clickerAssistants', 'clickerMultiplier', 'totalClicks',
          'achievements', 'prestigePoints', 'prestigeUpgrades',
          'dailyQuests', 'lastQuestDate'
        ];
        clickerKeys.forEach(key => localStorage.removeItem(key));
        
        // Manually reset state without reloading
        setScore(0);
        setClickPower(1);
        setAutoClickRate(0);
        setAssistants(0);
        setClickMultiplier(1);
        setTotalClicks(0);
        setAchievements(initialAchievements);
        setPrestigePoints(0);
        setPrestigeUpgrades(initialPrestigeUpgrades);
        
        const newQuests = getNewDailyQuests();
        setDailyQuests(newQuests);
        localStorage.setItem('dailyQuests', JSON.stringify(newQuests));
        localStorage.setItem('lastQuestDate', new Date().toDateString());
        
        setScoreSinceQuestLoad(0);
        setFlyingNumbers([]);

        console.log("--- CLICKER GAME RESET COMPLETE ---");
      };

      console.log("--- CHEATS ENABLED ---");
      console.log("Use window.addScore(amount) to add score.");
      console.log("Use window.addPrestige(amount) to add prestige points.");
      console.log("Use window.resetClickerGame() to reset all progress.");
    }

  }, []);

  // Main state saving effect
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('clickerScore', JSON.stringify(score));
    localStorage.setItem('clickerClickPower', JSON.stringify(clickPower));
    localStorage.setItem('clickerAutoClickRate', JSON.stringify(autoClickRate));
    localStorage.setItem('clickerAssistants', JSON.stringify(assistants));
    localStorage.setItem('clickerMultiplier', JSON.stringify(clickMultiplier));
    localStorage.setItem('totalClicks', JSON.stringify(totalClicks));
    localStorage.setItem('achievements', JSON.stringify(achievements));
    localStorage.setItem('prestigePoints', JSON.stringify(prestigePoints));
    localStorage.setItem('prestigeUpgrades', JSON.stringify(prestigeUpgrades));

    if (totalPassiveIncome > 0) {
      const interval = setInterval(() => {
        setScore((prevScore: number) => prevScore + totalPassiveIncome / 10);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [score, clickPower, autoClickRate, assistants, clickMultiplier, totalPassiveIncome, totalClicks, achievements, prestigePoints, prestigeUpgrades, isClient]);

  // Проверка достижений
  useEffect(() => {
    const newAchievements = { ...achievements };
    let achievementUnlocked = false;

    // Проверка кликов
    if (totalClicks >= 100 && !newAchievements.CLICK_100.unlocked) {
      newAchievements.CLICK_100.unlocked = true;
      achievementUnlocked = true;
    }
    if (totalClicks >= 1000 && !newAchievements.CLICK_1000.unlocked) {
      newAchievements.CLICK_1000.unlocked = true;
      achievementUnlocked = true;
    }
    // Проверка улучшений
    if (clickPower >= 10 && !newAchievements.INVESTOR.unlocked) {
      newAchievements.INVESTOR.unlocked = true;
      achievementUnlocked = true;
    }
    if (assistants >= 5 && !newAchievements.MANAGER.unlocked) {
      newAchievements.MANAGER.unlocked = true;
      achievementUnlocked = true;
    }

    if (achievementUnlocked) {
      const justUnlocked = Object.values(newAchievements).find(
        (ach, i) => ach.unlocked && !Object.values(achievements)[i].unlocked
      );
      if (justUnlocked) {
        setUnlockedAchievement(justUnlocked);
        setTimeout(() => {
          setUnlockedAchievement(null);
        }, 3000); // Popup will disappear after 3 seconds
      }
      setAchievements(newAchievements);
    }
  }, [totalClicks, clickPower, assistants, achievements]);

  useEffect(() => {
    const lastQuestDate = localStorage.getItem('lastQuestDate');
    const today = new Date().toDateString();

    if (lastQuestDate !== today) {
      const newQuests = getNewDailyQuests();
      setDailyQuests(newQuests);
      localStorage.setItem('dailyQuests', JSON.stringify(newQuests));
      localStorage.setItem('lastQuestDate', today);
    } else {
      const savedQuests = localStorage.getItem('dailyQuests');
      if (savedQuests) {
        setDailyQuests(JSON.parse(savedQuests));
      }
    }
    setScoreSinceQuestLoad(score); // Track score delta for quests
  }, []); // Runs only once on mount

  const updateQuestProgress = useCallback((questId: QuestID, value: number) => {
    setDailyQuests(prevQuests => {
      const newQuests = prevQuests.map(q => {
        if (q.questId === questId && !q.isCompleted) {
          const newProgress = q.progress + value;
          const isCompleted = newProgress >= q.goal;
          return { ...q, progress: Math.min(newProgress, q.goal), isCompleted };
        }
        return q;
      });
      // Save updated quests to localStorage
      localStorage.setItem('dailyQuests', JSON.stringify(newQuests));
      return newQuests;
    });
  }, []);

  // Quest progress tracking for score
  useEffect(() => {
    const scoreEarned = score - scoreSinceQuestLoad;
    if (scoreEarned > 0) {
      updateQuestProgress('EARN_SCORE', scoreEarned);
      setScoreSinceQuestLoad(score); // Reset baseline
    }
  }, [score, scoreSinceQuestLoad, updateQuestProgress]);

  const handleManualClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setScore(prevScore => prevScore + totalClickPower);
    setTotalClicks(prev => prev + 1);
    updateQuestProgress('CLICKS', 1);

    // Add flying number effect at cursor position
    const parentRect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (parentRect) {
      const x = e.clientX - parentRect.left;
      const y = e.clientY - parentRect.top;

      setFlyingNumbers(prev => [
        ...prev,
        { id: Date.now(), value: totalClickPower, x, y },
      ]);
    }
  };

  const buyClickPower = () => {
    const cost = clickPowerCost;
    if (score >= cost) {
      setScore((prevScore: number) => prevScore - cost);
      setClickPower((prev: number) => prev + 1);
      updateQuestProgress('BUY_UPGRADES', 1);
    }
  };

  const buyAutoClick = () => {
    const cost = autoClickCost;
    if (score >= cost) {
      setScore((prevScore: number) => prevScore - cost);
      setAutoClickRate((prev: number) => prev + 1);
      updateQuestProgress('BUY_UPGRADES', 1);
    }
  };

  const buyAssistant = () => {
    const cost = assistantCost;
    if (score >= cost) {
      setScore((prevScore: number) => prevScore - cost);
      setAssistants((prev: number) => prev + 1);
      updateQuestProgress('BUY_UPGRADES', 1);
    }
  };

  const buyMultiplier = () => {
    const cost = multiplierCost;
    if (score >= cost) {
      setScore((prevScore: number) => prevScore - cost);
      setClickMultiplier((prev: number) => prev + 1);
      updateQuestProgress('BUY_UPGRADES', 1);
    }
  };

  const handlePrestige = () => {
    if (score >= PRESTIGE_REQUIREMENT) {
      // Calculate points based on how many millions of score were earned
      const newPrestigePoints = Math.floor(score / PRESTIGE_REQUIREMENT);
      setPrestigePoints((prev: number) => prev + newPrestigePoints);
      
      // Reset progress
      setScore(0);
      setClickPower(1);
      setAutoClickRate(0);
      setAssistants(0);
      setClickMultiplier(1);
      // Note: totalClicks and achievements are NOT reset
    }
  };

  const claimQuestReward = (questId: string) => {
    setDailyQuests(prevQuests => {
      const newQuests = prevQuests.map(q => {
        if (q.id === questId && q.isCompleted && !q.isClaimed) {
          setScore((prevScore: number) => prevScore + q.reward);
          return { ...q, isClaimed: true };
        }
        return q;
      });
      localStorage.setItem('dailyQuests', JSON.stringify(newQuests));
      return newQuests;
    });
  };

  const buyPrestigeUpgrade = (upgradeId: PrestigeUpgradeID) => {
    const upgrade = prestigeUpgrades[upgradeId];
    const cost = upgrade.cost(upgrade.level);
    if (prestigePoints >= cost) {
      setPrestigePoints((prev: number) => prev - cost);
      setPrestigeUpgrades((prev) => ({
        ...prev,
        [upgradeId]: {
          ...prev[upgradeId],
          level: prev[upgradeId].level + 1,
        },
      }));
      updateQuestProgress('BUY_UPGRADES', 1);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto p-4 bg-gray-800 text-white rounded-lg shadow-lg overflow-hidden">
      <AnimatePresence>
        {unlockedAchievement && (
          <AchievementPopup
            name={unlockedAchievement.name}
            description={unlockedAchievement.description}
            onClose={() => setUnlockedAchievement(null)}
          />
        )}
      </AnimatePresence>

      <div className="text-center mb-4">
        <h2 className="text-5xl font-extrabold">{Math.floor(score)}</h2>
        <p className="text-gray-400">Очков</p>
      </div>

      {/* Prestige Info */}
      {prestigePoints > 0 && (
        <div className="text-center mb-4 p-2 bg-purple-500/20 rounded-lg">
          <p className="text-lg font-bold text-purple-300">Бонус Престижа: +{Math.round(prestigeBonus * 100 - 100)}% ко всему доходу</p>
          <p className="text-sm text-gray-400">Очков Престижа: {prestigePoints}</p>
        </div>
      )}

      <div className="relative text-center mb-8">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleManualClick}
          className="relative px-8 py-4 bg-cyan-500 hover:bg-cyan-600 rounded-full text-2xl font-bold shadow-lg overflow-hidden"
        >
          Клик!
        </motion.button>
        <AnimatePresence>
          {flyingNumbers.map(num => (
            <motion.div
              key={num.id}
              initial={{ opacity: 1, y: 0, x: '-50%' }}
              animate={{ opacity: 0, y: -80, transition: { duration: 1.5 } }}
              onAnimationComplete={() => {
                setFlyingNumbers(prev => prev.filter(n => n.id !== num.id));
              }}
              className="absolute text-yellow-400 text-2xl font-bold pointer-events-none"
              style={{ left: num.x, top: num.y }}
            >
              +{num.value.toLocaleString()}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Улучшение силы клика */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-bold">Сила клика: {clickPower}</h3>
          <p className="text-sm text-gray-400 mb-2">Увеличивает очки за каждый клик.</p>
          <button
            onClick={buyClickPower}
            disabled={score < clickPowerCost}
            className="w-full px-4 py-2 bg-green-500 rounded-lg font-bold disabled:bg-gray-500"
          >
            Купить ({clickPowerCost} очков)
          </button>
        </div>

        {/* Улучшение авто-клика */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-bold">Авто-клик: {autoClickRate}/сек</h3>
          <p className="text-sm text-gray-400 mb-2">Автоматически добавляет очки.</p>
          <button
            onClick={buyAutoClick}
            disabled={score < autoClickCost}
            className="w-full px-4 py-2 bg-purple-500 rounded-lg font-bold disabled:bg-gray-500"
          >
            Купить ({autoClickCost} очков)
          </button>
        </div>

        {/* Покупка ассистента */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-bold">Ассистенты: {assistants} (+{assistants * 5}/сек)</h3>
          <p className="text-sm text-gray-400 mb-2">Нанимайте помощников для пассивного дохода.</p>
          <button
            onClick={buyAssistant}
            disabled={score < assistantCost}
            className="w-full px-4 py-2 bg-blue-500 rounded-lg font-bold disabled:bg-gray-500"
          >
            Нанять ({assistantCost} очков)
          </button>
        </div>

        {/* Покупка множителя */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-bold">Множитель клика: x{clickMultiplier}</h3>
          <p className="text-sm text-gray-400 mb-2">Увеличивает всю силу вашего клика.</p>
          <button
            onClick={buyMultiplier}
            disabled={score < multiplierCost}
            className="w-full px-4 py-2 bg-red-500 rounded-lg font-bold disabled:bg-gray-500"
          >
            Улучшить ({multiplierCost} очков)
          </button>
        </div>
      </div>

      {/* Prestige Button */}
      <div className="mt-6 p-4 border-t-2 border-purple-500/30">
        <h3 className="text-xl font-bold text-center mb-2 text-purple-300">Престиж</h3>
        <p className="text-center text-sm text-gray-400 mb-4">
          Достигните {PRESTIGE_REQUIREMENT.toLocaleString()} очков, чтобы сбросить прогресс и получить очки престижа,
          которые навсегда увеличат ваш доход.
        </p>
        <button
          onClick={handlePrestige}
          disabled={score < PRESTIGE_REQUIREMENT}
          className="w-full p-3 bg-purple-600 rounded-lg font-bold text-lg hover:bg-purple-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Сброс ради Престижа ({Math.floor(score/PRESTIGE_REQUIREMENT)} очков)
        </button>
      </div>

      {/* Daily Quests */}
      <div className="mt-6 p-4 border-t-2 border-blue-500/30">
        <h3 className="text-xl font-bold text-center mb-4 text-blue-300">Ежедневные Задания</h3>
        <div className="space-y-4">
          {dailyQuests.map((quest) => {
            const progressPercentage = (quest.progress / quest.goal) * 100;
            return (
              <div key={quest.id} className="p-3 bg-gray-700/50 rounded-lg">
                <p className="font-semibold">{quest.description}</p>
                <div className="w-full bg-gray-600 rounded-full h-4 my-2">
                  <motion.div
                    className="bg-blue-500 h-4 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">
                    {quest.progress.toLocaleString()} / {quest.goal.toLocaleString()}
                  </p>
                  <button
                    onClick={() => claimQuestReward(quest.id)}
                    disabled={!quest.isCompleted || quest.isClaimed}
                    className="px-4 py-1 bg-blue-600 rounded-lg font-bold text-sm hover:bg-blue-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    {quest.isClaimed ? 'Получено' : `+${quest.reward.toLocaleString()}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prestige Upgrades */}
      {prestigePoints > 0 && (
        <div className="mt-6 p-4 border-t-2 border-purple-500/30">
          <h3 className="text-xl font-bold text-center mb-4 text-purple-300">Улучшения Престижа</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(prestigeUpgrades).map((upgrade) => {
              const cost = upgrade.cost(upgrade.level);
              return (
                <div key={upgrade.id} className="p-3 bg-gray-700/50 rounded-lg">
                  <h4 className="font-bold">{upgrade.name} (Ур. {upgrade.level})</h4>
                  <p className="text-sm text-gray-400 min-h-[40px]">{upgrade.description(upgrade.level)}</p>
                  <button
                    onClick={() => buyPrestigeUpgrade(upgrade.id)}
                    disabled={prestigePoints < cost}
                    className="w-full mt-2 p-2 bg-purple-600 rounded-lg font-bold text-sm hover:bg-purple-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    Купить: {cost} очков
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="mt-6 p-4 border-t-2 border-yellow-500/30">
        <h3 className="text-xl font-bold text-center mb-4 text-yellow-300">Достижения</h3>
        {Object.values(achievements).map((ach) => (
          <div key={ach.id} className={`p-2 rounded-md mb-2 transition-all ${ach.unlocked ? 'bg-green-500/30' : 'bg-gray-700/50'}`}>
            <p className="font-bold">{ach.name} {ach.unlocked ? '✓' : ''}</p>
            <p className="text-sm text-gray-400">{ach.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClickerGame; 