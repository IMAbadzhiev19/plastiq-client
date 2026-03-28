import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppTab } from "../types";
import { theme } from "../theme";
import { BrainIcon, ProfileIcon, ScannerFrameIcon, TrophyIcon } from "./icons";

type BottomNavProps = {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
};

const tabs: { key: AppTab; label: string }[] = [
  { key: "scan", label: "Scan" },
  { key: "profile", label: "Profile" },
  { key: "practice", label: "Practice" },
  { key: "badges", label: "Badges" },
];

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.inner}>
        {tabs.map((tab) => {
          const active = tab.key === activeTab;

          return (
            <Pressable key={tab.key} style={styles.tab} onPress={() => onChange(tab.key)}>
              {tab.key === "scan" ? <ScannerFrameIcon active={active} /> : null}
              {tab.key === "profile" ? <ProfileIcon color={active ? theme.colors.primary : theme.colors.textMuted} size={18} /> : null}
              {tab.key === "practice" ? <BrainIcon color={active ? theme.colors.primary : theme.colors.textMuted} size={18} /> : null}
              {tab.key === "badges" ? <TrophyIcon color={active ? theme.colors.primary : theme.colors.textMuted} size={18} /> : null}
              <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 12,
  },
  inner: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minHeight: 52,
  },
  label: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  labelActive: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
});
