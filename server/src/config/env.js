const dotenv = require("dotenv");
const path = require("node:path");

dotenv.config({
  path: path.resolve(__dirname, "..", "..", ".env"),
});

const env = {
  port: Number(process.env.PORT || 4000),
  clientOrigin:
    process.env.CLIENT_ORIGIN || "http://localhost:19006,http://localhost:8081",
  profileKey: process.env.PROFILE_KEY || "local-demo",
  profileName: process.env.PROFILE_NAME || "Eco Learner",
  uploadsDirectory:
    process.env.UPLOADS_DIRECTORY || path.resolve(__dirname, "..", "..", "uploads"),
  scanUploadsDirectory:
    process.env.SCAN_UPLOADS_DIRECTORY ||
    path.resolve(__dirname, "..", "..", "uploads", "scans"),
  sqlitePath:
    process.env.SQLITE_PATH || path.resolve(__dirname, "..", "..", "data", "plastiq.sqlite"),
};

module.exports = {
  env,
};
