import { NativeModules, Platform } from "react-native";

import { AppState } from "../types";

function getWebBaseUrl() {
  if (typeof window === "undefined") {
    return "http://localhost:4000/api";
  }

  return `http://${window.location.hostname}:4000/api`;
}

function getNativeBaseUrl() {
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  const hostMatch =
    typeof scriptURL === "string" ? scriptURL.match(/https?:\/\/([^/:]+)/) : null;
  const host = hostMatch?.[1];

  if (!host) {
    return Platform.OS === "android" ? "http://10.0.2.2:4000/api" : "http://localhost:4000/api";
  }

  if (Platform.OS === "android" && ["localhost", "127.0.0.1"].includes(host)) {
    return "http://10.0.2.2:4000/api";
  }

  return `http://${host}:4000/api`;
}

const fallbackBaseUrl = Platform.OS === "web" ? getWebBaseUrl() : getNativeBaseUrl();
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || fallbackBaseUrl;
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

type AppStateResponse = {
  appState: AppState;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);

  if (init?.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const fallbackMessage = `Request failed with status ${response.status}`;

    try {
      const payload = await response.json();
      throw new Error(payload.error || fallbackMessage);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw new Error(fallbackMessage);
    }
  }

  return response.json() as Promise<T>;
}

export async function fetchAppState() {
  const payload = await request<AppStateResponse>("/app-state");
  return payload.appState;
}

export async function submitScan(input: {
  productName: string;
  plasticDigit: number;
  imageDataUrl: string;
}) {
  const payload = await request<AppStateResponse>("/scans", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return payload.appState;
}

export function resolveAssetUrl(assetPath?: string | null) {
  if (!assetPath) {
    return null;
  }

  if (/^https?:\/\//.test(assetPath)) {
    return assetPath;
  }

  return `${API_ORIGIN}${assetPath.startsWith("/") ? assetPath : `/${assetPath}`}`;
}

export async function submitPracticeAttempt(input: {
  questionId: string;
  selectedAnswer: string;
}) {
  const payload = await request<AppStateResponse>("/practice-attempts", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return payload.appState;
}
