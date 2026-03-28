import React from "react";
import { StyleSheet, View } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { theme } from "../theme";

type IconProps = {
  color?: string;
  size?: number;
};

export function CameraIcon({ color = theme.colors.textSoft, size = 28 }: IconProps) {
  return <Feather name="camera" size={size} color={color} />;
}

export function ScanIcon({ color = theme.colors.textMuted, size = 22 }: IconProps) {
  return <MaterialCommunityIcons name="line-scan" size={size} color={color} />;
}

export function ProfileIcon({ color = theme.colors.textMuted, size = 22 }: IconProps) {
  return <Feather name="user" size={size} color={color} />;
}

export function BrainIcon({ color = theme.colors.textMuted, size = 22 }: IconProps) {
  return <MaterialCommunityIcons name="brain" size={size} color={color} />;
}

export function TrophyIcon({ color = theme.colors.textMuted, size = 22 }: IconProps) {
  return <Feather name="award" size={size} color={color} />;
}

export function CubeIcon({ color = theme.colors.primaryGlow, size = 24 }: IconProps) {
  return <MaterialCommunityIcons name="cube-outline" size={size} color={color} />;
}

export function RecycleIcon({ color = theme.colors.textSoft, size = 32 }: IconProps) {
  return <MaterialCommunityIcons name="recycle" size={size} color={color} />;
}

export function LockIcon({ color = theme.colors.textSoft, size = 32 }: IconProps) {
  return <Feather name="lock" size={size} color={color} />;
}

export function FireIcon({ color = "#FF9B3D", size = 24 }: IconProps) {
  return <Ionicons name="flame-outline" size={size} color={color} />;
}

export function BadgeMedalIcon({ color = theme.colors.textSoft, size = 28 }: IconProps) {
  return <MaterialCommunityIcons name="medal-outline" size={size} color={color} />;
}

export function ScannerFrameIcon({ active = false }: { active?: boolean }) {
  return (
    <View style={[styles.frame, active && styles.frameActive]}>
      <View style={[styles.corner, styles.topLeft, active && styles.cornerActive]} />
      <View style={[styles.corner, styles.topRight, active && styles.cornerActive]} />
      <View style={[styles.corner, styles.bottomLeft, active && styles.cornerActive]} />
      <View style={[styles.corner, styles.bottomRight, active && styles.cornerActive]} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: 18,
    height: 18,
  },
  frameActive: {
    transform: [{ scale: 1.03 }],
  },
  corner: {
    position: "absolute",
    width: 6,
    height: 6,
    borderColor: theme.colors.textMuted,
  },
  cornerActive: {
    borderColor: theme.colors.primary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 1.8,
    borderLeftWidth: 1.8,
    borderTopLeftRadius: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 1.8,
    borderRightWidth: 1.8,
    borderTopRightRadius: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 1.8,
    borderLeftWidth: 1.8,
    borderBottomLeftRadius: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 1.8,
    borderRightWidth: 1.8,
    borderBottomRightRadius: 3,
  },
});
