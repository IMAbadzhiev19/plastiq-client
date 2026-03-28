import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Badge } from "../types";
import { theme } from "../theme";
import { BadgeMedalIcon, TrophyIcon } from "../components/icons";
import { Card, EmptyState, GradientHeader, Pill, Screen } from "../components/ui";

type BadgesScreenProps = {
  badges: Badge[];
};

export function BadgesScreen({ badges }: BadgesScreenProps) {
  const unlockedCount = badges.filter((badge) => badge.unlocked).length;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <GradientHeader colors={[theme.colors.purple, theme.colors.purpleDark]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Badges</Text>
              <Text style={styles.headerSubtitle}>
                {unlockedCount} of {badges.length} learned
              </Text>
            </View>
            <View style={styles.trophyBubble}>
              <TrophyIcon color="#FFFFFF" size={24} />
            </View>
          </View>
          <View style={styles.headerTrack}>
            <View
              style={[
                styles.headerFill,
                { width: `${(unlockedCount / Math.max(badges.length, 1)) * 100}%` },
              ]}
            />
          </View>
        </GradientHeader>

        <View style={styles.body}>
          <Text style={styles.sectionTitle}>Locked Badges ({badges.length - unlockedCount})</Text>
          {badges.map((badge) => (
            <Card key={badge.id} style={styles.badgeCard}>
              <View style={[styles.badgeIconWrap, badge.unlocked && styles.badgeIconWrapUnlocked]}>
                <BadgeMedalIcon color={badge.unlocked ? theme.colors.primary : theme.colors.textSoft} />
              </View>
              <View style={styles.badgeCopy}>
                <Text style={[styles.badgeTitle, badge.unlocked && styles.badgeTitleUnlocked]}>{badge.title}</Text>
                <Text style={[styles.badgeDescription, badge.unlocked && styles.badgeDescriptionUnlocked]}>{badge.description}</Text>
                <Pill label={badge.requirement} />
              </View>
            </Card>
          ))}

          <EmptyState
            icon={<TrophyIcon color={theme.colors.textSoft} size={42} />}
            title="No Badges Yet"
            description="Start scanning products and answering questions to earn badges."
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: theme.typography.h1,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "rgba(255,255,255,0.72)",
  },
  trophyBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTrack: {
    height: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.24)",
    overflow: "hidden",
  },
  headerFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.72)",
  },
  body: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: 16,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  badgeCard: {
    flexDirection: "row",
    gap: 16,
    padding: 16,
  },
  badgeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EEF2F7",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeCopy: {
    flex: 1,
    gap: 6,
  },
  badgeIconWrapUnlocked: {
    backgroundColor: "#EAF1FF",
  },
  badgeTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#8D98AA",
  },
  badgeTitleUnlocked: {
    color: theme.colors.text,
  },
  badgeDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: "#B0B9C9",
  },
  badgeDescriptionUnlocked: {
    color: theme.colors.textMuted,
  },
});
