const { env } = require("./config/env");
const { store, storageMode } = require("./lib/store");
const { GameService } = require("./services/gameService");
const { createApp } = require("./app");

const gameService = new GameService(store, {
  profileKey: env.profileKey,
  profileName: env.profileName,
});

const app = createApp({
  gameService,
  clientOrigin: env.clientOrigin,
  storageMode,
  profileKey: env.profileKey,
  uploadsDirectory: env.uploadsDirectory,
});

app.listen(env.port, () => {
  console.log(`Plastiq server listening on http://localhost:${env.port} using ${storageMode} storage`);
});
