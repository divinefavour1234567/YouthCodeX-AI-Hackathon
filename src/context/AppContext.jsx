import React, { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Load initial API key from localStorage
  const [apiKey, setApiKeyState] = useState(() => {
    return localStorage.getItem("pathfinder_gemini_key") || "";
  });

  // Load progress stats from localStorage
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem("pathfinder_progress");
    return saved
      ? JSON.parse(saved)
      : {
          completedMilestones: [],
          interviewScores: {}, // { 'software-engineer': [85, 92] }
          completedRpgs: [], // ['software-engineer']
          expPoints: 0,
          rank: "Explorer",
          scoreHistory: [
            { date: "Jun 18", score: 65, type: "Interview" },
            { date: "Jun 19", score: 72, type: "Resume" },
            { date: "Jun 20", score: 78, type: "Interview" }
          ]
        };
  });

  // Persist API key
  const setApiKey = (key) => {
    setApiKeyState(key);
    localStorage.setItem("pathfinder_gemini_key", key);
  };

  // Sync progress to localStorage
  useEffect(() => {
    localStorage.setItem("pathfinder_progress", JSON.stringify(progress));
  }, [progress]);

  // Complete/toggle a skill milestone
  const toggleMilestone = (milestoneId) => {
    setProgress((prev) => {
      const isCompleted = prev.completedMilestones.includes(milestoneId);
      const newMilestones = isCompleted
        ? prev.completedMilestones.filter((id) => id !== milestoneId)
        : [...prev.completedMilestones, milestoneId];
      
      const expChange = isCompleted ? -50 : 50;
      const newExp = Math.max(0, prev.expPoints + expChange);
      
      return {
        ...prev,
        completedMilestones: newMilestones,
        expPoints: newExp,
        rank: getRankFromExp(newExp)
      };
    });
  };

  // Save an interview score
  const saveInterviewScore = (roleId, score) => {
    setProgress((prev) => {
      const roleScores = prev.interviewScores[roleId] || [];
      const newScores = [...roleScores, score];
      
      const newExp = prev.expPoints + 150; // award experience
      
      const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const newHistoryItem = { date: today, score, type: "Interview" };
      
      return {
        ...prev,
        interviewScores: {
          ...prev.interviewScores,
          [roleId]: newScores
        },
        expPoints: newExp,
        rank: getRankFromExp(newExp),
        scoreHistory: [...prev.scoreHistory, newHistoryItem].slice(-6) // keep last 6 scores
      };
    });
  };

  // Complete an RPG run
  const saveRpgCompletion = (roleId) => {
    setProgress((prev) => {
      if (prev.completedRpgs.includes(roleId)) return prev;
      
      const newExp = prev.expPoints + 200; // large experience award
      
      return {
        ...prev,
        completedRpgs: [...prev.completedRpgs, roleId],
        expPoints: newExp,
        rank: getRankFromExp(newExp)
      };
    });
  };

  // Leveling engine
  const getRankFromExp = (exp) => {
    if (exp >= 1000) return "Master Coach";
    if (exp >= 600) return "Professional Career Specialist";
    if (exp >= 300) return "Junior PathFinder";
    return "Explorer";
  };

  return (
    <AppContext.Provider
      value={{
        apiKey,
        setApiKey,
        progress,
        toggleMilestone,
        saveInterviewScore,
        saveRpgCompletion
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
