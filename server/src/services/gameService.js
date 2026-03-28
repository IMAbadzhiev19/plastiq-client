const { BADGE_DEFINITIONS } = require("../data/badges");
const { PLASTIC_LEVELS, getPlasticByDigit } = require("../data/plastics");
const { QUESTION_BANK } = require("../data/questionBank");
const { isoNow, isPreviousDay, todayKey } = require("../utils/dates");

class GameService {
  constructor(store, defaults) {
    this.store = store;
    this.defaults = defaults;
    this.hasSeededQuestions = false;
  }

  async initialize() {
    if (this.hasSeededQuestions) {
      return;
    }

    this.validateQuestionBank();
    await this.store.seedQuestions(QUESTION_BANK);
    this.hasSeededQuestions = true;
  }

  async getAppState(profileKey = this.defaults.profileKey) {
    await this.initialize();

    const profile = await this.store.ensureProfile(profileKey, this.defaults.profileName);
    const inventory = await this.store.listInventory(profile.id);
    const unlockedLevels = await this.store.listUnlockedLevels(profile.id);
    const practice = await this.buildPracticeState(profile, unlockedLevels);
    const stats = this.buildStats(profile, inventory, unlockedLevels);

    return {
      meta: {
        profileKey,
        generatedAt: isoNow(),
      },
      scanner: {
        stats: {
          products: stats.productsScanned,
          levelsUnlocked: stats.unlockedLevelCount,
          totalLevels: PLASTIC_LEVELS.length,
          streakDays: stats.streakDays,
        },
      },
      profile: {
        id: profile.id,
        displayName: profile.display_name,
        joinedOn: profile.joined_on,
        streakDays: stats.streakDays,
        productsScanned: stats.productsScanned,
        levelProgress: stats.unlockedLevelCount,
        totalLevels: PLASTIC_LEVELS.length,
        unlockedTypesMessage: this.buildUnlockedTypesMessage(unlockedLevels),
        levels: PLASTIC_LEVELS.map((plastic) => ({
          id: plastic.digit,
          unlocked: unlockedLevels.some((entry) => entry.plastic_digit === plastic.digit),
          color: plastic.color,
        })),
        recentScans: inventory.slice(0, 5).map((item) => this.mapInventoryItem(item)),
        inventory: inventory.map((item) => this.mapInventoryItem(item)),
      },
      practice,
      badges: this.buildBadges(stats),
    };
  }

  async submitScan(profileKey, payload) {
    await this.initialize();

    const profile = await this.store.ensureProfile(profileKey, this.defaults.profileName);
    const plastic = getPlasticByDigit(payload.plasticDigit);

    await this.store.addInventoryItem(profile.id, {
      product_name: payload.productName,
      plastic_digit: plastic.digit,
      plastic_code: plastic.code,
      plastic_name: plastic.name,
      image_path: payload.imageDataUrl
        ? await this.store.saveScanImage(profile.id, payload.imageDataUrl)
        : null,
      recyclable: plastic.recyclable,
      scanned_at: isoNow(),
    });

    await this.store.unlockLevel(profile.id, plastic.digit);
    await this.store.updateProfile(profile.id, {
      total_products_scanned: profile.total_products_scanned + 1,
    });
    await this.refreshDailyAssignments(profile.id);

    return this.getAppState(profileKey);
  }

  async submitPracticeAttempt(profileKey, payload) {
    await this.initialize();

    const profile = await this.store.ensureProfile(profileKey, this.defaults.profileName);
    const unlockedLevels = await this.store.listUnlockedLevels(profile.id);
    const assignments = await this.ensureDailyAssignments(profile.id, unlockedLevels);
    const assignment = assignments.find((entry) => entry.question_id === payload.questionId);

    if (!assignment) {
      const error = new Error("Question is not assigned for today.");
      error.statusCode = 400;
      throw error;
    }

    const existingAttempt = await this.store.findAttempt(profile.id, todayKey(), payload.questionId);

    if (existingAttempt) {
      return this.getAppState(profileKey);
    }

    const questions = await this.store.listQuestions();
    const question = questions.find((entry) => entry.id === payload.questionId);
    const isCorrect = question.correct_answer === payload.selectedAnswer;

    await this.store.createAttempt({
      profile_id: profile.id,
      question_id: payload.questionId,
      assignment_date: todayKey(),
      selected_answer: payload.selectedAnswer,
      is_correct: isCorrect,
    });

    if (isCorrect) {
      const patch = {
        total_correct_answers: profile.total_correct_answers + 1,
      };

      if (profile.last_correct_answer_on !== todayKey()) {
        patch.streak_count = isPreviousDay(profile.last_correct_answer_on, todayKey())
          ? profile.streak_count + 1
          : 1;
        patch.last_correct_answer_on = todayKey();
      }

      await this.store.updateProfile(profile.id, patch);
    }

    return this.getAppState(profileKey);
  }

  async resetMemoryProfile(profileKey) {
    if (typeof this.store.reset !== "function") {
      const error = new Error("Reset is only available in memory mode.");
      error.statusCode = 400;
      throw error;
    }

    this.store.reset();
    this.hasSeededQuestions = false;

    return this.getAppState(profileKey);
  }

  async refreshDailyAssignments(profileId) {
    const attempts = await this.store.listAttempts(profileId, todayKey());

    if (attempts.length > 0) {
      return;
    }

    await this.store.deleteAssignments(profileId, todayKey());
  }

  async buildPracticeState(profile, unlockedLevels) {
    const assignments = await this.ensureDailyAssignments(profile.id, unlockedLevels);
    const attempts = await this.store.listAttempts(profile.id, todayKey());
    const questions = await this.store.listQuestions();

    const mappedQuestions = assignments
      .map((assignment) => {
        const question = questions.find((entry) => entry.id === assignment.question_id);
        const attempt = attempts.find((entry) => entry.question_id === assignment.question_id);

        return {
          id: question.id,
          levelDigit: question.plastic_digit,
          prompt: question.prompt,
          options: question.options,
          answer: question.correct_answer,
          explanation: question.explanation,
          answered: Boolean(attempt),
          selectedAnswer: attempt ? attempt.selected_answer : null,
          isCorrect: attempt ? attempt.is_correct : null,
        };
      })
      .filter(Boolean);

    if (unlockedLevels.length === 0) {
      return {
        availableToday: false,
        headline: "No Questions Available",
        description: "Scan your first plastic bottle to unlock your first level and begin practice.",
        questions: [],
      };
    }

    if (mappedQuestions.length === 0) {
      return {
        availableToday: false,
        headline: "No Questions Available",
        description: "You have unlocked levels, but today has no assigned questions yet.",
        questions: [],
      };
    }

    const unansweredCount = mappedQuestions.filter((question) => !question.answered).length;

    return {
      availableToday: true,
      headline: unansweredCount > 0 ? "Your Daily Questions" : "Today's Practice Is Complete",
      description:
        unansweredCount > 0
          ? `You have ${unansweredCount} question${unansweredCount === 1 ? "" : "s"} left today.`
          : "You answered all of today's questions. Come back tomorrow for a fresh set.",
      questions: mappedQuestions,
    };
  }

  async ensureDailyAssignments(profileId, unlockedLevels) {
    const todayAssignments = await this.store.listAssignments(profileId, todayKey());

    if (todayAssignments.length > 0) {
      return todayAssignments;
    }

    if (unlockedLevels.length === 0) {
      return [];
    }

    const unlockedDigits = unlockedLevels.map((entry) => entry.plastic_digit);
    const allQuestions = await this.store.listQuestions();
    const assignedQuestionIds = new Set(await this.store.listAssignedQuestionIds(profileId));

    const candidates = allQuestions.filter((question) => unlockedDigits.includes(question.plastic_digit));
    const unseen = this.shuffleList(
      candidates.filter((question) => !assignedQuestionIds.has(question.id)),
    );
    const seen = this.shuffleList(
      candidates.filter((question) => assignedQuestionIds.has(question.id)),
    );
    const selected = [...unseen, ...seen].slice(0, 3);

    if (selected.length === 0) {
      return [];
    }

    return this.store.createAssignments(
      selected.map((question, index) => ({
        profile_id: profileId,
        assignment_date: todayKey(),
        question_id: question.id,
        position: index + 1,
      })),
    );
  }

  buildStats(profile, inventory, unlockedLevels) {
    const recyclableDigits = new Set(
      inventory.filter((item) => item.recyclable).map((item) => item.plastic_digit),
    );

    return {
      streakDays: profile.streak_count,
      productsScanned: profile.total_products_scanned,
      unlockedLevelCount: unlockedLevels.length,
      totalCorrectAnswers: profile.total_correct_answers,
      uniqueRecyclableLevels: recyclableDigits.size,
    };
  }

  buildUnlockedTypesMessage(unlockedLevels) {
    if (unlockedLevels.length === 0) {
      return "Scan your first product to unlock levels and build your plastic inventory.";
    }

    const labels = unlockedLevels
      .map((entry) => getPlasticByDigit(entry.plastic_digit))
      .filter(Boolean)
      .map((plastic) => plastic.code);

    return `Unlocked plastic types: ${labels.join(", ")}.`;
  }

  buildBadges(stats) {
    return BADGE_DEFINITIONS.map((badge) => ({
      id: badge.code,
      title: badge.title,
      description: badge.description,
      requirement: badge.requirement,
      unlocked: badge.isUnlocked(stats),
    }));
  }

  mapInventoryItem(item) {
    return {
      id: item.id,
      productName: item.product_name,
      plasticDigit: item.plastic_digit,
      plasticType: item.plastic_code,
      plasticName: item.plastic_name,
      imageUrl: item.image_path || null,
      recyclable: item.recyclable,
      scannedAt: item.scanned_at,
    };
  }

  shuffleList(items) {
    const shuffled = [...items];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }

    return shuffled;
  }

  validateQuestionBank() {
    const countsByDigit = QUESTION_BANK.reduce((accumulator, question) => {
      accumulator[question.plastic_digit] = (accumulator[question.plastic_digit] || 0) + 1;
      return accumulator;
    }, {});

    for (const plastic of PLASTIC_LEVELS) {
      if ((countsByDigit[plastic.digit] || 0) < 3) {
        throw new Error(`Plastic digit ${plastic.digit} needs at least 3 practice questions.`);
      }
    }
  }
}

module.exports = {
  GameService,
};
