import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { resolveAssetUrl } from "../api/appClient";
import { ProfileData } from "../types";
import { theme } from "../theme";
import { BadgeMedalIcon, CubeIcon, FireIcon, RecycleIcon } from "../components/icons";
import { Card, EmptyState, GradientHeader, Pill, Screen, SectionTitle, StatCard } from "../components/ui";

type ProfileScreenProps = {
  profile: ProfileData;
};

export function ProfileScreen({ profile }: ProfileScreenProps) {
  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <GradientHeader colors={[theme.colors.primary, theme.colors.primaryDark]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>My Profile</Text>
              <Text style={styles.headerSubtitle}>Track your learning journey</Text>
            </View>
            <LinearGradient colors={["rgba(255,255,255,0.18)", "rgba(255,255,255,0.10)"]} style={styles.headerBadge}>
              <BadgeMedalIcon color="#FFFFFF" size={24} />
            </LinearGradient>
          </View>

          <View style={styles.profileStats}>
            <StatCard
              value={`${profile.streakDays}`}
              label="Day Streak"
              valueColor="#FFFFFF"
              labelColor="rgba(255,255,255,0.76)"
              icon={<FireIcon color="#FFC16D" size={22} />}
              style={styles.topStat}
            />
            <StatCard
              value={`${profile.productsScanned}`}
              label="Products"
              valueColor="#FFFFFF"
              labelColor="rgba(255,255,255,0.76)"
              icon={<CubeIcon color="#A9FFBC" size={22} />}
              style={styles.topStat}
            />
          </View>
        </GradientHeader>

        <View style={styles.body}>
          <Card style={styles.levelCard}>
            <View style={styles.cardHeading}>
              <Text style={styles.cardTitle}>Level Progress</Text>
              <Text style={styles.cardMeta}>
                {profile.levelProgress}/{profile.totalLevels} Unlocked
              </Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(profile.levelProgress / profile.totalLevels) * 100}%` },
                ]}
              />
            </View>

            <View style={styles.levelRow}>
              {profile.levels.map((level) => (
                <View
                  key={level.id}
                  style={[
                    styles.levelChip,
                    { backgroundColor: level.color, opacity: level.unlocked ? 1 : 0.85 },
                  ]}
                >
                  <Text style={styles.levelChipText}>{level.id}</Text>
                </View>
              ))}
            </View>
          </Card>

          <View>
            <SectionTitle title="Unlocked Plastic Types" />
            <EmptyState
              icon={<RecycleIcon />}
              title="Momentum is building"
              description={profile.unlockedTypesMessage}
            />
          </View>

          <View>
            <SectionTitle title={`Inventory (${profile.inventory.length})`} />
            {profile.inventory.length > 0 ? (
              profile.inventory.map((scan) => (
                <Card key={scan.id} style={styles.scanCard}>
                  {scan.imageUrl ? (
                    <Image source={{ uri: resolveAssetUrl(scan.imageUrl) || undefined }} style={styles.scanImage} />
                  ) : (
                    <View style={styles.scanIconBubble}>
                      <CubeIcon color={theme.colors.textSoft} />
                    </View>
                  )}
                  <View style={styles.scanCopy}>
                    <Text style={styles.scanTitle}>{scan.productName}</Text>
                    <Text style={styles.scanMeta}>
                      Digit {scan.plasticDigit} • {scan.plasticType} • {scan.recyclable ? "Recyclable" : "Check local guidance"}
                    </Text>
                    <Pill label={scan.scannedAt} />
                  </View>
                </Card>
              ))
            ) : (
              <EmptyState
                icon={<CubeIcon color={theme.colors.textSoft} />}
                title="No items in your inventory yet"
                description="Scan your first bottle from the Scan tab and it will appear here."
              />
            )}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 28,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: theme.typography.h1,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "rgba(255,255,255,0.78)",
  },
  headerBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  profileStats: {
    flexDirection: "row",
    gap: 12,
  },
  topStat: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(255,255,255,0.10)",
    minHeight: 86,
  },
  body: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: 14,
    gap: 20,
  },
  levelCard: {
    padding: 16,
    gap: 18,
  },
  cardHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  cardMeta: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.track,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  levelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  levelChip: {
    width: 31,
    height: 31,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  levelChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.textMuted,
  },
  scanCard: {
    flexDirection: "row",
    padding: 16,
    gap: 14,
    marginBottom: 12,
  },
  scanIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  scanImage: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceMuted,
  },
  scanCopy: {
    flex: 1,
    gap: 6,
  },
  scanTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
  },
  scanMeta: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
});
