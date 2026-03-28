const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { DatabaseSync } = require("node:sqlite");

class SqliteStore {
  constructor({ databasePath, scanUploadsDirectory }) {
    this.databasePath = databasePath;
    this.scanUploadsDirectory = scanUploadsDirectory;
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
    fs.mkdirSync(scanUploadsDirectory, { recursive: true });
    this.db = new DatabaseSync(databasePath);
    this.db.exec("PRAGMA foreign_keys = ON;");
    this.db.exec("PRAGMA journal_mode = WAL;");
    this.initializeSchema();
  }

  initializeSchema() {
    const schemaPath = path.resolve(__dirname, "..", "..", "db", "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");
    this.db.exec(schema);
    this.migrateLegacySchema();
  }

  migrateLegacySchema() {
    const inventoryColumns = this.db
      .prepare("pragma table_info(inventory_items)")
      .all()
      .map((column) => column.name);

    if (!inventoryColumns.includes("image_path")) {
      this.db.exec("alter table inventory_items add column image_path text");
    }
  }

  async reset() {
    this.db.exec(`
      delete from practice_attempts;
      delete from daily_question_assignments;
      delete from unlocked_levels;
      delete from inventory_items;
      delete from practice_questions;
      delete from profiles;
    `);
  }

  async seedQuestions(questionBank) {
    const countRow = this.db.prepare("select count(*) as count from practice_questions").get();

    if (countRow.count > 0) {
      return;
    }

    const insert = this.db.prepare(`
      insert into practice_questions (
        id,
        plastic_digit,
        prompt,
        options,
        correct_answer,
        explanation,
        created_at
      ) values (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const question of questionBank) {
      insert.run(
        question.id,
        question.plastic_digit,
        question.prompt,
        JSON.stringify(question.options),
        question.correct_answer,
        question.explanation,
        new Date().toISOString(),
      );
    }
  }

  async ensureProfile(externalKey, displayName) {
    const existing = this.db
      .prepare("select * from profiles where external_key = ?")
      .get(externalKey);

    if (existing) {
      return { ...existing };
    }

    const now = new Date().toISOString();
    const joinedOn = now.slice(0, 10);
    const id = randomUUID();

    this.db
      .prepare(`
        insert into profiles (
          id,
          external_key,
          display_name,
          joined_on,
          streak_count,
          last_correct_answer_on,
          total_products_scanned,
          total_correct_answers,
          created_at,
          updated_at
        ) values (?, ?, ?, ?, 0, null, 0, 0, ?, ?)
      `)
      .run(id, externalKey, displayName, joinedOn, now, now);

    return this.db.prepare("select * from profiles where id = ?").get(id);
  }

  async updateProfile(profileId, patch) {
    const current = this.db.prepare("select * from profiles where id = ?").get(profileId);

    const next = {
      ...current,
      ...patch,
      updated_at: new Date().toISOString(),
    };

    this.db
      .prepare(`
        update profiles
        set display_name = ?,
            joined_on = ?,
            streak_count = ?,
            last_correct_answer_on = ?,
            total_products_scanned = ?,
            total_correct_answers = ?,
            updated_at = ?
        where id = ?
      `)
      .run(
        next.display_name,
        next.joined_on,
        next.streak_count,
        next.last_correct_answer_on,
        next.total_products_scanned,
        next.total_correct_answers,
        next.updated_at,
        profileId,
      );

    return this.db.prepare("select * from profiles where id = ?").get(profileId);
  }

  async listInventory(profileId) {
    return this.db
      .prepare("select * from inventory_items where profile_id = ? order by scanned_at desc")
      .all(profileId)
      .map((entry) => ({ ...entry, recyclable: Boolean(entry.recyclable) }));
  }

  async addInventoryItem(profileId, item) {
    const id = randomUUID();

    this.db
      .prepare(`
        insert into inventory_items (
          id,
          profile_id,
          product_name,
          plastic_digit,
          plastic_code,
          plastic_name,
          image_path,
          recyclable,
          scanned_at
        ) values (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        id,
        profileId,
        item.product_name,
        item.plastic_digit,
        item.plastic_code,
        item.plastic_name,
        item.image_path,
        item.recyclable ? 1 : 0,
        item.scanned_at,
      );

    return this.db.prepare("select * from inventory_items where id = ?").get(id);
  }

  async saveScanImage(profileId, imageDataUrl) {
    const match = imageDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s);

    if (!match) {
      const error = new Error("Scan image payload is invalid.");
      error.statusCode = 400;
      throw error;
    }

    const [, mimeType, base64Payload] = match;
    const extension = this.getImageExtension(mimeType);
    const fileName = `${profileId}-${Date.now()}-${randomUUID()}.${extension}`;
    const filePath = path.resolve(this.scanUploadsDirectory, fileName);

    fs.writeFileSync(filePath, Buffer.from(base64Payload, "base64"));

    return path.posix.join("/uploads", "scans", fileName);
  }

  getImageExtension(mimeType) {
    const extensionMap = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/heic": "heic",
      "image/heif": "heif",
    };

    return extensionMap[mimeType] || "jpg";
  }

  async listUnlockedLevels(profileId) {
    return this.db
      .prepare("select * from unlocked_levels where profile_id = ? order by plastic_digit asc")
      .all(profileId);
  }

  async unlockLevel(profileId, plasticDigit) {
    this.db
      .prepare(`
        insert or ignore into unlocked_levels (
          profile_id,
          plastic_digit,
          unlocked_at
        ) values (?, ?, ?)
      `)
      .run(profileId, plasticDigit, new Date().toISOString());

    return this.db
      .prepare("select * from unlocked_levels where profile_id = ? and plastic_digit = ?")
      .get(profileId, plasticDigit);
  }

  async listQuestions() {
    return this.db
      .prepare("select * from practice_questions order by plastic_digit asc, id asc")
      .all()
      .map((entry) => ({
        ...entry,
        options: JSON.parse(entry.options),
      }));
  }

  async listAssignments(profileId, assignmentDate) {
    return this.db
      .prepare(`
        select * from daily_question_assignments
        where profile_id = ? and assignment_date = ?
        order by position asc
      `)
      .all(profileId, assignmentDate);
  }

  async deleteAssignments(profileId, assignmentDate) {
    this.db
      .prepare(`
        delete from daily_question_assignments
        where profile_id = ? and assignment_date = ?
      `)
      .run(profileId, assignmentDate);
  }

  async listAssignedQuestionIds(profileId) {
    return this.db
      .prepare("select question_id from daily_question_assignments where profile_id = ?")
      .all(profileId)
      .map((entry) => entry.question_id);
  }

  async createAssignments(rows) {
    const insert = this.db.prepare(`
      insert into daily_question_assignments (
        id,
        profile_id,
        assignment_date,
        question_id,
        position,
        created_at
      ) values (?, ?, ?, ?, ?, ?)
    `);

    const createdAt = new Date().toISOString();
    const ids = [];

    for (const row of rows) {
      const id = randomUUID();
      ids.push(id);
      insert.run(
        id,
        row.profile_id,
        row.assignment_date,
        row.question_id,
        row.position,
        createdAt,
      );
    }

    return this.db
      .prepare(`
        select * from daily_question_assignments
        where id in (${ids.map(() => "?").join(",")})
        order by position asc
      `)
      .all(...ids);
  }

  async listAttempts(profileId, assignmentDate) {
    return this.db
      .prepare(`
        select * from practice_attempts
        where profile_id = ? and assignment_date = ?
      `)
      .all(profileId, assignmentDate)
      .map((entry) => ({ ...entry, is_correct: Boolean(entry.is_correct) }));
  }

  async findAttempt(profileId, assignmentDate, questionId) {
    const entry = this.db
      .prepare(`
        select * from practice_attempts
        where profile_id = ? and assignment_date = ? and question_id = ?
      `)
      .get(profileId, assignmentDate, questionId);

    return entry ? { ...entry, is_correct: Boolean(entry.is_correct) } : null;
  }

  async createAttempt(row) {
    const id = randomUUID();
    const answeredAt = new Date().toISOString();

    this.db
      .prepare(`
        insert into practice_attempts (
          id,
          profile_id,
          assignment_date,
          question_id,
          selected_answer,
          is_correct,
          answered_at
        ) values (?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        id,
        row.profile_id,
        row.assignment_date,
        row.question_id,
        row.selected_answer,
        row.is_correct ? 1 : 0,
        answeredAt,
      );

    const entry = this.db.prepare("select * from practice_attempts where id = ?").get(id);
    return { ...entry, is_correct: Boolean(entry.is_correct) };
  }
}

module.exports = {
  SqliteStore,
};
