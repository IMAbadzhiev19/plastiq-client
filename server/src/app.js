const cors = require("cors");
const express = require("express");

const { createAppRoutes } = require("./routes/appRoutes");

function createApp({ gameService, clientOrigin, storageMode, profileKey, uploadsDirectory }) {
  const app = express();
  const configuredOrigins = new Set(
    String(clientOrigin)
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),
  );

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          callback(null, true);
          return;
        }

        try {
          const parsedOrigin = new URL(origin);
          const isLocalDevOrigin = ["localhost", "127.0.0.1"].includes(parsedOrigin.hostname);

          if (isLocalDevOrigin || configuredOrigins.has(origin)) {
            callback(null, true);
            return;
          }
        } catch (_error) {
          // Fall through to the explicit rejection below.
        }

        callback(new Error(`Origin ${origin} is not allowed by CORS.`));
      },
      credentials: false,
    }),
  );
  app.use(express.json({ limit: "8mb" }));
  app.use("/uploads", express.static(uploadsDirectory));

  app.use(
    "/api",
    createAppRoutes({
      gameService,
      storageMode,
      profileKey,
    }),
  );

  app.use((error, _request, response, _next) => {
    const statusCode = error.statusCode || 500;
    const message =
      error.name === "ZodError"
        ? "Request validation failed."
        : error.message || "Unexpected server error.";

    response.status(statusCode).json({
      error: message,
      details: error.name === "ZodError" ? error.flatten() : undefined,
    });
  });

  return app;
}

module.exports = {
  createApp,
};
