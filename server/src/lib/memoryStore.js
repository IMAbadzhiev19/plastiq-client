const { randomUUID } = require("node:crypto");

class MemoryStore {
  constructor() {
    this.reset();
  }

  reset() {
    this.profiles = [];
    this.inventoryItems = [];
    this.unlockedLevels = [];
    this.practiceQuestions = [];
    this.dailyAssignments = [];
    this.practiceAttempts = [];
  }

  async seedQuestions(questionBank) {
    if (this.practiceQuestions.length === 0) {
      this.practiceQuestions = questionBank.map((question) => ({ ...question }));
    }
  }

  async ensureProfile(externalKey, displayName) {
    let profile = this.profiles.find((entry) => entry.external_key === externalKey);

    if (!profile) {
      profile = {
        id: randomUUID(),
        external_key: externalKey,
        display_name: displayName,
        joined_on: new Date().toISOString().slice(0, 10),
        streak_count: 0,
        last_correct_answer_on: null,
        total_products_scanned: 0,
        total_correct_answers: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.profiles.push(profile);
    }

    return { ...profile };
  }

  async updateProfile(profileId, patch) {
    const profile = this.profiles.find((entry) => entry.id === profileId);
    Object.assign(profile, patch, { updated_at: new Date().toISOString() });
    return { ...profile };
  }

  async listInventory(profileId) {
    return this.inventoryItems
      .filter((entry) => entry.profile_id === profileId)
      .sort((left, right) => right.scanned_at.localeCompare(left.scanned_at))
      .map((entry) => ({ ...entry }));
  }

  async addInventoryItem(profileId, item) {
    const row = {
      id: randomUUID(),
      profile_id: profileId,
      ...item,
    };
    this.inventoryItems.push(row);
    return { ...row };
  }

  async listUnlockedLevels(profileId) {
    return this.unlockedLevels
      .filter((entry) => entry.profile_id === profileId)
      .map((entry) => ({ ...entry }));
  }

  async unlockLevel(profileId, plasticDigit) {
    const existing = this.unlockedLevels.find(
      (entry) => entry.profile_id === profileId && entry.plastic_digit === plasticDigit,
    );

    if (existing) {
      return { ...existing };
    }

    const row = {
      profile_id: profileId,
      plastic_digit: plasticDigit,
      unlocked_at: new Date().toISOString(),
    };
    this.unlockedLevels.push(row);
    return { ...row };
  }

  async listQuestions() {
    return this.practiceQuestions.map((entry) => ({ ...entry }));
  }

  async listAssignments(profileId, assignmentDate) {
    return this.dailyAssignments
      .filter((entry) => entry.profile_id === profileId && entry.assignment_date === assignmentDate)
      .sort((left, right) => left.position - right.position)
      .map((entry) => ({ ...entry }));
  }

  async listAssignedQuestionIds(profileId) {
    return this.dailyAssignments
      .filter((entry) => entry.profile_id === profileId)
      .map((entry) => entry.question_id);
  }

  async createAssignments(rows) {
    const created = rows.map((row) => ({
      id: randomUUID(),
      ...row,
      created_at: new Date().toISOString(),
    }));
    this.dailyAssignments.push(...created);
    return created.map((entry) => ({ ...entry }));
  }

  async listAttempts(profileId, assignmentDate) {
    return this.practiceAttempts
      .filter((entry) => entry.profile_id === profileId && entry.assignment_date === assignmentDate)
      .map((entry) => ({ ...entry }));
  }

  async findAttempt(profileId, assignmentDate, questionId) {
    const attempt = this.practiceAttempts.find(
      (entry) =>
        entry.profile_id === profileId &&
        entry.assignment_date === assignmentDate &&
        entry.question_id === questionId,
    );

    return attempt ? { ...attempt } : null;
  }

  async createAttempt(row) {
    const attempt = {
      id: randomUUID(),
      ...row,
      answered_at: new Date().toISOString(),
    };
    this.practiceAttempts.push(attempt);
    return { ...attempt };
  }
}

module.exports = {
  MemoryStore,
};
