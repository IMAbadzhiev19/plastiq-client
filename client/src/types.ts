export type AppTab = "scan" | "profile" | "practice" | "badges";

export type ScannerStats = {
  products: number;
  levelsUnlocked: number;
  totalLevels: number;
  streakDays: number;
};

export type InventoryItem = {
  id: string;
  productName: string;
  plasticDigit: number;
  plasticType: string;
  plasticName: string;
  imageUrl: string | null;
  recyclable: boolean;
  scannedAt: string;
};

export type ScanItem = InventoryItem;

export type LevelItem = {
  id: number;
  unlocked: boolean;
  color: string;
};

export type ProfileData = {
  id: string;
  displayName: string;
  joinedOn: string;
  streakDays: number;
  productsScanned: number;
  levelProgress: number;
  totalLevels: number;
  unlockedTypesMessage: string;
  levels: LevelItem[];
  recentScans: ScanItem[];
  inventory: InventoryItem[];
};

export type PracticeQuestion = {
  id: string;
  levelDigit: number;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
  answered: boolean;
  selectedAnswer: string | null;
  isCorrect: boolean | null;
};

export type PracticeState = {
  availableToday: boolean;
  headline: string;
  description: string;
  questions: PracticeQuestion[];
};

export type Badge = {
  id: string;
  title: string;
  description: string;
  requirement: string;
  unlocked: boolean;
};

export type AppState = {
  scanner: {
    stats: ScannerStats;
  };
  profile: ProfileData;
  practice: PracticeState;
  badges: Badge[];
};
