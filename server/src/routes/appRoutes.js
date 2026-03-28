const express = require("express");
const { z } = require("zod");

function createAppRoutes({ gameService, storageMode, profileKey }) {
  const router = express.Router();

  router.get("/health", (_request, response) => {
    response.json({
      ok: true,
      storageMode,
    });
  });

  router.get("/app-state", async (_request, response, next) => {
    try {
      const appState = await gameService.getAppState(profileKey);
      response.json({
        storageMode,
        appState,
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/scans", async (request, response, next) => {
    const schema = z.object({
      productName: z.string().trim().min(2).max(80),
      plasticDigit: z.number().int().min(1).max(7),
      imageDataUrl: z
        .string()
        .trim()
        .max(7_500_000)
        .refine((value) => value.startsWith("data:image/"), {
          message: "Scan image must be a valid image data URL.",
        })
        .optional()
        .nullable(),
    });

    try {
      const payload = schema.parse(request.body);
      const appState = await gameService.submitScan(profileKey, payload);

      response.status(201).json({
        storageMode,
        appState,
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/practice-attempts", async (request, response, next) => {
    const schema = z.object({
      questionId: z.string().min(1),
      selectedAnswer: z.string().min(1),
    });

    try {
      const payload = schema.parse(request.body);
      const appState = await gameService.submitPracticeAttempt(profileKey, payload);

      response.status(201).json({
        storageMode,
        appState,
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/dev/reset", async (_request, response, next) => {
    try {
      const appState = await gameService.resetMemoryProfile(profileKey);
      response.json({
        storageMode,
        appState,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = {
  createAppRoutes,
};
