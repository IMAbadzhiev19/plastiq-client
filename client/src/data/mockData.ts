import { Badge, PracticeState, ProfileData, ScanItem, ScannerStats } from "../types";

export const scannerStats: ScannerStats = {
  products: 24,
  levelsUnlocked: 4,
  totalLevels: 7,
  streakDays: 6,
};

export const scanHistory: ScanItem[] = [
  {
    id: "scan-1",
    productName: "Sparkling Water Bottle",
    plasticDigit: 1,
    plasticType: "PET",
    plasticName: "Polyethylene Terephthalate",
    imageUrl: null,
    recyclable: true,
    scannedAt: "Today, 09:24",
  },
  {
    id: "scan-2",
    productName: "Yogurt Cup",
    plasticDigit: 5,
    plasticType: "PP",
    plasticName: "Polypropylene",
    imageUrl: null,
    recyclable: true,
    scannedAt: "Yesterday",
  },
  {
    id: "scan-3",
    productName: "Detergent Bottle",
    plasticDigit: 2,
    plasticType: "HDPE",
    plasticName: "High-Density Polyethylene",
    imageUrl: null,
    recyclable: true,
    scannedAt: "Mar 26",
  },
];

export const profileData: ProfileData = {
  id: "mock-profile",
  displayName: "Eco Learner",
  joinedOn: "2026-03-28",
  streakDays: 6,
  productsScanned: 24,
  levelProgress: 4,
  totalLevels: 7,
  unlockedTypesMessage: "You have identified PET, HDPE, PVC and PP so far.",
  levels: [
    { id: 1, unlocked: true, color: "#D5E7FF" },
    { id: 2, unlocked: true, color: "#D7F6E5" },
    { id: 3, unlocked: true, color: "#FFE4AF" },
    { id: 4, unlocked: true, color: "#E7D8FF" },
    { id: 5, unlocked: false, color: "#F3D6E6" },
    { id: 6, unlocked: false, color: "#FFD0CB" },
    { id: 7, unlocked: false, color: "#D7D9DE" },
  ],
  recentScans: scanHistory,
  inventory: scanHistory,
};

export const practiceState: PracticeState = {
  availableToday: false,
  headline: "No Questions Available",
  description: "Scan your next plastic product to unlock a fresh daily practice set.",
  questions: [
    {
      id: "q-1",
      levelDigit: 1,
      prompt: "Which plastic type is commonly used for water bottles?",
      options: ["PET", "PVC", "PS", "Other"],
      answer: "PET",
      explanation: "PET is lightweight, clear and widely used for beverage packaging.",
      answered: false,
      selectedAnswer: null,
      isCorrect: null,
    },
    {
      id: "q-2",
      levelDigit: 5,
      prompt: "Which plastic is typically considered safe for reusable food containers?",
      options: ["PP", "PVC", "PS", "LDPE"],
      answer: "PP",
      explanation: "Polypropylene is durable and commonly used for reusable food storage.",
      answered: false,
      selectedAnswer: null,
      isCorrect: null,
    },
  ],
};

export const badges: Badge[] = [
  {
    id: "badge-1",
    title: "First Steps",
    description: "Scanned your first plastic product",
    requirement: "Scan 1 product",
    unlocked: false,
  },
  {
    id: "badge-2",
    title: "Plastic Explorer",
    description: "Unlocked 3 plastic types",
    requirement: "Unlock 3 levels",
    unlocked: false,
  },
  {
    id: "badge-3",
    title: "Plastic Master",
    description: "Unlocked all 7 plastic types",
    requirement: "Unlock all 7 levels",
    unlocked: false,
  },
  {
    id: "badge-4",
    title: "Getting Started",
    description: "Maintained a 3-day streak",
    requirement: "3-day streak",
    unlocked: false,
  },
  {
    id: "badge-5",
    title: "Week Warrior",
    description: "Maintained a 7-day streak",
    requirement: "7-day streak",
    unlocked: false,
  },
  {
    id: "badge-6",
    title: "Dedication",
    description: "Maintained a 30-day streak",
    requirement: "30-day streak",
    unlocked: false,
  },
  {
    id: "badge-7",
    title: "Quick Learner",
    description: "Answered 10 questions correctly",
    requirement: "Answer 10 questions",
    unlocked: false,
  },
  {
    id: "badge-8",
    title: "Knowledge Seeker",
    description: "Answered 50 questions correctly",
    requirement: "Answer 50 questions",
    unlocked: false,
  },
  {
    id: "badge-9",
    title: "Sustainability Expert",
    description: "Answered 100 questions correctly",
    requirement: "Answer 100 questions",
    unlocked: false,
  },
  {
    id: "badge-10",
    title: "Collector",
    description: "Scanned 10 different products",
    requirement: "Scan 10 products",
    unlocked: false,
  },
  {
    id: "badge-11",
    title: "Eco Warrior",
    description: "Scanned 5 recyclable plastic types",
    requirement: "Scan 5 recyclable types",
    unlocked: false,
  },
];
