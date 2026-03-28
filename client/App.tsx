import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";

import { fetchAppState, submitPracticeAttempt, submitScan } from "./src/api/appClient";
import { BottomNav } from "./src/components/BottomNav";
import { BadgesScreen } from "./src/screens/BadgesScreen";
import { PracticeScreen } from "./src/screens/PracticeScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { ScannerScreen } from "./src/screens/ScannerScreen";
import { AppState, AppTab } from "./src/types";
import { theme } from "./src/theme";

void SplashScreen.preventAutoHideAsync();

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("scan");
  const [isSplashComplete, setIsSplashComplete] = useState(false);
  const [appState, setAppState] = useState<AppState | null>(null);
  const [screenError, setScreenError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingScan, setIsSavingScan] = useState(false);
  const [isSavingPractice, setIsSavingPractice] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setScreenError("");
        setIsLoading(true);
        const state = await fetchAppState();
        setAppState(state);
      } catch (error) {
        setScreenError(error instanceof Error ? error.message : "Unable to load app data.");
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsSplashComplete(true);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!isSplashComplete) {
      return;
    }

    void SplashScreen.hideAsync();
  }, [isSplashComplete]);

  const screen = useMemo(() => {
    if (!appState) {
      return null;
    }

    switch (activeTab) {
      case "profile":
        return <ProfileScreen profile={appState.profile} />;
      case "practice":
        return (
          <PracticeScreen
            practiceState={appState.practice}
            isSubmittingAnswer={isSavingPractice}
            onSubmitAnswer={async (questionId, selectedAnswer) => {
              try {
                setScreenError("");
                setIsSavingPractice(true);
                const nextState = await submitPracticeAttempt({ questionId, selectedAnswer });
                setAppState(nextState);
              } catch (error) {
                setScreenError(error instanceof Error ? error.message : "Unable to submit answer.");
              } finally {
                setIsSavingPractice(false);
              }
            }}
          />
        );
      case "badges":
        return <BadgesScreen badges={appState.badges} />;
      case "scan":
      default:
        return (
          <ScannerScreen
            stats={appState.scanner.stats}
            recentScans={appState.profile.recentScans}
            isSubmittingScan={isSavingScan}
            onSubmitScan={async (productName, plasticDigit, imageDataUrl) => {
              try {
                setScreenError("");
                setIsSavingScan(true);
                const nextState = await submitScan({ productName, plasticDigit, imageDataUrl });
                setAppState(nextState);
                setActiveTab("profile");
              } catch (error) {
                setScreenError(error instanceof Error ? error.message : "Unable to save scan.");
              } finally {
                setIsSavingScan(false);
              }
            }}
          />
        );
    }
  }, [activeTab, appState, isSavingPractice, isSavingScan]);

  if (!isSplashComplete) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="dark" />
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <View style={styles.appShell}>
        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.helperText}>Loading your plastic learning journey...</Text>
            </View>
          ) : appState ? (
            screen
          ) : (
            <View style={styles.centerState}>
              <Text style={styles.errorTitle}>The app could not load</Text>
              <Text style={styles.helperText}>
                {screenError || "Start the Express server and refresh the app."}
              </Text>
            </View>
          )}
        </View>
        {screenError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{screenError}</Text>
          </View>
        ) : null}
        <BottomNav activeTab={activeTab} onChange={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  appShell: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 14,
  },
  helperText: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
  },
  errorBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#FFF1ED",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFD8CC",
  },
  errorBannerText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#B74220",
    textAlign: "center",
  },
});
