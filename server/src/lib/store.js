const { env } = require("../config/env");
const { SqliteStore } = require("./sqliteStore");

const store = new SqliteStore({
  databasePath: env.sqlitePath,
  scanUploadsDirectory: env.scanUploadsDirectory,
});

module.exports = {
  store,
  storageMode: "sqlite",
};
