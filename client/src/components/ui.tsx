import React, { ReactNode } from "react";
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { theme } from "../theme";

export function Screen({ children }: { children: ReactNode }) {
  return <View style={styles.screen}>{children}</View>;
}

export function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function GradientHeader({
  colors,
  children,
}: {
  colors: [string, string];
  children: ReactNode;
}) {
  return <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>{children}</LinearGradient>;
}

export function PrimaryButton({
  label,
  onPress,
  icon,
  disabled,
}: {
  label: string;
  onPress?: () => void;
  icon?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <Pressable style={[styles.button, disabled && styles.buttonDisabled]} onPress={onPress} disabled={disabled}>
      <View style={styles.buttonIcon}>{icon}</View>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card style={styles.emptyCard}>
      <View style={styles.emptyIcon}>{icon}</View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </Card>
  );
}

export function StatCard({
  value,
  label,
  valueColor,
  labelColor,
  icon,
  style,
}: {
  value: string;
  label: string;
  valueColor?: string;
  labelColor?: string;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Card style={[styles.statCard, style]}>
      {icon ? <View style={styles.statIconWrap}>{icon}</View> : null}
      <Text style={[styles.statValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
      <Text style={[styles.statLabel, labelColor ? { color: labelColor } : null]}>{label}</Text>
    </Card>
  );
}

export function Pill({ label }: { label: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  sectionTitle: {
    fontSize: theme.typography.h2,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  button: {
    height: 46,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  buttonIcon: {
    position: "absolute",
    left: 14,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  emptyCard: {
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 24,
    gap: 12,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 96,
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 8,
  },
  statIconWrap: {
    marginBottom: 4,
  },
  statValue: {
    fontSize: 30,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  pill: {
    alignSelf: "flex-start",
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: "500",
  },
});
