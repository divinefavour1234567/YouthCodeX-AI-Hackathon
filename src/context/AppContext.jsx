import React, { createContext, useState, useEffect } from "react";
import { playLevelUpSound, playSuccessSound, playErrorSound } from "../services/sound";


export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Load initial API key from localStorage
  const [apiKey, setApiKeyState] = useState(() => {
    return localStorage.getItem("pathfinder_gemini_key") || "";
  });

  // Leveling helper thresholds
  const getLevelFromExp = (exp) => {
    if (exp >= 2100) return 6;
    if (exp >= 1500) return 5;
    if (exp >= 1000) return 4;
    if (exp >= 600) return 3;
    if (exp >= 300) return 2;
    return 1;
  };

  const getRankFromLevel = (lvl) => {
    switch (lvl) {
      case 6: return "Executive Partner";
      case 5: return "Lead Principal";
      case 4: return "Senior Specialist";
      case 3: return "Associate Consultant";
      case 2: return "Tech Analyst";
      default: return "Junior Intern";
    }
  };

  // Load progress stats from localStorage
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem("pathfinder_progress");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure level and rank match updated gamification formula
      const lvl = getLevelFromExp(parsed.expPoints || 0);
      return {
        ...parsed,
        level: lvl,
        rank: getRankFromLevel(lvl)
      };
    }
    return {
      completedMilestones: [],
      interviewScores: {}, 
      completedRpgs: [], 
      expPoints: 0,
      level: 1,
      rank: "Junior Intern",
      scoreHistory: [
        { date: "Jun 18", score: 65, type: "Interview" }
      ]
    };
  });

  // State to trigger custom Level Up alert banners in UI
  const [showLevelUpAlert, setShowLevelUpAlert] = useState(false);
  const [lastLeveledUpTo, setLastLeveledUpTo] = useState(1);

  // Persist API key
  const setApiKey = (key) => {
    setApiKeyState(key);
    localStorage.setItem("pathfinder_gemini_key", key);
  };

  // Sync progress to localStorage
  useEffect(() => {
    localStorage.setItem("pathfinder_progress", JSON.stringify(progress));
  }, [progress]);

  // Unified XP addition logic with level-up trigger checks
  const addExperiencePoints = (pts) => {
    setProgress((prev) => {
      const newExp = Math.max(0, prev.expPoints + pts);
      const prevLvl = prev.level;
      const nextLvl = getLevelFromExp(newExp);
      const nextRank = getRankFromLevel(nextLvl);

      if (nextLvl > prevLvl) {
        // Level up occurred! Play sound and flag alerts
        playLevelUpSound();
        setLastLeveledUpTo(nextLvl);
        setShowLevelUpAlert(true);
        window.dispatchEvent(new CustomEvent("cosmic-explosion", {
          detail: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
        }));
      }

      return {
        ...prev,
        expPoints: newExp,
        level: nextLvl,
        rank: nextRank
      };
    });
  };

  // Complete/toggle a skill milestone
  const toggleMilestone = (milestoneId) => {
    setProgress((prev) => {
      const isCompleted = prev.completedMilestones.includes(milestoneId);
      const newMilestones = isCompleted
        ? prev.completedMilestones.filter((id) => id !== milestoneId)
        : [...prev.completedMilestones, milestoneId];
      
      const expChange = isCompleted ? -50 : 50;
      
      // Compute updates
      const newExp = Math.max(0, prev.expPoints + expChange);
      const nextLvl = getLevelFromExp(newExp);
      
      if (nextLvl > prev.level && expChange > 0) {
        playLevelUpSound();
        setLastLeveledUpTo(nextLvl);
        setShowLevelUpAlert(true);
        window.dispatchEvent(new CustomEvent("cosmic-explosion", {
          detail: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
        }));
      } else {
        if (isCompleted) {
          playErrorSound();
        } else {
          playSuccessSound();
        }
      }

      return {
        ...prev,
        completedMilestones: newMilestones,
        expPoints: newExp,
        level: nextLvl,
        rank: getRankFromLevel(nextLvl)
      };
    });
  };

  // Save an interview score
  const saveInterviewScore = (roleId, score) => {
    setProgress((prev) => {
      const roleScores = prev.interviewScores[roleId] || [];
      const newScores = [...roleScores, score];
      
      const newExp = prev.expPoints + 150; // award 150 XP
      const nextLvl = getLevelFromExp(newExp);
      
      if (nextLvl > prev.level) {
        playLevelUpSound();
        setLastLeveledUpTo(nextLvl);
        setShowLevelUpAlert(true);
        window.dispatchEvent(new CustomEvent("cosmic-explosion", {
          detail: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
        }));
      }

      const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const newHistoryItem = { date: today, score, type: "Interview" };
      
      return {
        ...prev,
        interviewScores: {
          ...prev.interviewScores,
          [roleId]: newScores
        },
        expPoints: newExp,
        level: nextLvl,
        rank: getRankFromLevel(nextLvl),
        scoreHistory: [...prev.scoreHistory, newHistoryItem].slice(-6)
      };
    });
  };

  // Complete an RPG run
  const saveRpgCompletion = (roleId) => {
    setProgress((prev) => {
      if (prev.completedRpgs.includes(roleId)) return prev;
      
      const newExp = prev.expPoints + 200; // award 200 XP
      const nextLvl = getLevelFromExp(newExp);
      
      if (nextLvl > prev.level) {
        playLevelUpSound();
        setLastLeveledUpTo(nextLvl);
        setShowLevelUpAlert(true);
        window.dispatchEvent(new CustomEvent("cosmic-explosion", {
          detail: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
        }));
      }

      return {
        ...prev,
        completedRpgs: [...prev.completedRpgs, roleId],
        expPoints: newExp,
        level: nextLvl,
        rank: getRankFromLevel(nextLvl)
      };
    });
  };

  // Reset progress (for debug and replaying)
  const resetProgress = () => {
    const fresh = {
      completedMilestones: [],
      interviewScores: {},
      completedRpgs: [],
      expPoints: 0,
      level: 1,
      rank: "Junior Intern",
      scoreHistory: []
    };
    setProgress(fresh);
    localStorage.removeItem("pathfinder_progress");
  };

  return (
    <AppContext.Provider
      value={{
        apiKey,
        setApiKey,
        progress,
        toggleMilestone,
        saveInterviewScore,
        saveRpgCompletion,
        addExperiencePoints,
        resetProgress,
        showLevelUpAlert,
        setShowLevelUpAlert,
        lastLeveledUpTo
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
