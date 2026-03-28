const BADGE_DEFINITIONS = [
  {
    code: "first-steps",
    title: "First Steps",
    description: "Scanned your first plastic product",
    requirement: "Scan 1 product",
    isUnlocked: (stats) => stats.productsScanned >= 1,
  },
  {
    code: "plastic-explorer",
    title: "Plastic Explorer",
    description: "Unlocked 3 plastic types",
    requirement: "Unlock 3 levels",
    isUnlocked: (stats) => stats.unlockedLevelCount >= 3,
  },
  {
    code: "plastic-master",
    title: "Plastic Master",
    description: "Unlocked all 7 plastic types",
    requirement: "Unlock all 7 levels",
    isUnlocked: (stats) => stats.unlockedLevelCount >= 7,
  },
  {
    code: "getting-started",
    title: "Getting Started",
    description: "Maintained a 3-day streak",
    requirement: "3-day streak",
    isUnlocked: (stats) => stats.streakDays >= 3,
  },
  {
    code: "week-warrior",
    title: "Week Warrior",
    description: "Maintained a 7-day streak",
    requirement: "7-day streak",
    isUnlocked: (stats) => stats.streakDays >= 7,
  },
  {
    code: "dedication",
    title: "Dedication",
    description: "Maintained a 30-day streak",
    requirement: "30-day streak",
    isUnlocked: (stats) => stats.streakDays >= 30,
  },
  {
    code: "quick-learner",
    title: "Quick Learner",
    description: "Answered 10 questions correctly",
    requirement: "Answer 10 questions",
    isUnlocked: (stats) => stats.totalCorrectAnswers >= 10,
  },
  {
    code: "knowledge-seeker",
    title: "Knowledge Seeker",
    description: "Answered 50 questions correctly",
    requirement: "Answer 50 questions",
    isUnlocked: (stats) => stats.totalCorrectAnswers >= 50,
  },
  {
    code: "sustainability-expert",
    title: "Sustainability Expert",
    description: "Answered 100 questions correctly",
    requirement: "Answer 100 questions",
    isUnlocked: (stats) => stats.totalCorrectAnswers >= 100,
  },
  {
    code: "collector",
    title: "Collector",
    description: "Scanned 10 different products",
    requirement: "Scan 10 products",
    isUnlocked: (stats) => stats.productsScanned >= 10,
  },
  {
    code: "eco-warrior",
    title: "Eco Warrior",
    description: "Scanned 5 recyclable plastic types",
    requirement: "Scan 5 recyclable types",
    isUnlocked: (stats) => stats.uniqueRecyclableLevels >= 5,
  },
];

module.exports = {
  BADGE_DEFINITIONS,
};
