import React, { startTransition, useRef, useState } from "react";
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

import { ScanItem, ScannerStats } from "../types";
import { theme } from "../theme";
import { CameraIcon } from "../components/icons";
import { Card, PrimaryButton, Screen, SectionTitle, StatCard } from "../components/ui";

type ScannerScreenProps = {
  stats: ScannerStats;
  recentScans: ScanItem[];
  isSubmittingScan?: boolean;
  onSubmitScan: (productName: string, plasticDigit: number, imageDataUrl: string) => Promise<void>;
};

const plasticDigits = [1, 2, 3, 4, 5, 6, 7];

export function ScannerScreen({
  stats,
  recentScans,
  isSubmittingScan = false,
  onSubmitScan,
}: ScannerScreenProps) {
  const latestScan = recentScans[0];
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState("");
  const [capturedImageDataUrl, setCapturedImageDataUrl] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [selectedDigit, setSelectedDigit] = useState<number | null>(null);

  const handleCameraAction = async () => {
    if (permission?.granted) {
      startTransition(() => {
        setCaptureError("");

        if (capturedImageDataUrl) {
          setCapturedImageDataUrl(null);
          setIsCameraOpen(true);
          return;
        }

        setIsCameraOpen((current) => !current);
      });
      return;
    }

    const response = await requestPermission();

    if (response.granted) {
      startTransition(() => {
        setCaptureError("");
        setIsCameraOpen(true);
      });
    }
  };

  const actionLabel = permission?.granted
    ? capturedImageDataUrl
      ? "Retake Photo"
      : isCameraOpen
      ? "Close Camera"
      : "Open Front Camera"
    : Platform.OS === "web"
      ? "Allow Browser Camera"
      : "Allow Camera";

  const handleCapturePhoto = async () => {
    if (!cameraRef.current) {
      return;
    }

    try {
      setCaptureError("");
      setIsCapturing(true);

      const picture = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.45,
      });

      const imageDataUrl = picture?.base64
        ? `data:image/jpeg;base64,${picture.base64}`
        : typeof picture?.uri === "string" && picture.uri.startsWith("data:image/")
          ? picture.uri
          : null;

      if (!imageDataUrl) {
        throw new Error("The photo opened, but it could not be prepared for saving. Try again.");
      }

      setCapturedImageDataUrl(imageDataUrl);
      setIsCameraOpen(false);
    } catch (error) {
      setCaptureError(
        error instanceof Error ? error.message : "We could not capture the photo. Try again.",
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSaveScan = async () => {
    if (!productName.trim() || !selectedDigit || !capturedImageDataUrl) {
      return;
    }

    await onSubmitScan(productName.trim(), selectedDigit, capturedImageDataUrl);
    setProductName("");
    setSelectedDigit(null);
    setCapturedImageDataUrl(null);
    setCaptureError("");
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Plastic Scanner</Text>
          <Text style={styles.subtitle}>Scan products to learn about plastic types</Text>
        </View>

        <Card style={styles.previewCard}>
          <View style={styles.cameraTile}>
            {capturedImageDataUrl ? (
              <>
                <Image source={{ uri: capturedImageDataUrl }} style={styles.capturedPreview} />
                <View style={styles.cameraOverlay}>
                  <Text style={styles.overlayLabel}>Photo captured and ready to save</Text>
                  <Text style={styles.overlaySubLabel}>This image will be stored with the scan.</Text>
                </View>
              </>
            ) : isCameraOpen && permission?.granted ? (
              <>
                <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="front" />
                <View style={styles.cameraOverlay}>
                  <View style={styles.scanFrame} />
                  <Text style={styles.overlayLabel}>Point the camera at a plastic product</Text>
                  <Text style={styles.overlaySubLabel}>Front Camera</Text>
                </View>
              </>
            ) : (
              <View style={styles.cameraPlaceholder}>
                <CameraIcon color={theme.colors.textSoft} size={44} />
                <Text style={styles.placeholderTitle}>Camera preview is ready</Text>
                <Text style={styles.placeholderText}>
                  {permission?.granted
                    ? Platform.OS === "web"
                      ? "Tap below to open your MacBook/browser camera."
                      : "Tap the button below to open the live camera."
                    : Platform.OS === "web"
                      ? "Grant browser camera access to use your MacBook camera here."
                      : "Grant camera access to scan products from this screen."}
                </Text>
              </View>
            )}
          </View>
        </Card>

        <PrimaryButton label={actionLabel} onPress={handleCameraAction} icon={<CameraIcon color="#FFFFFF" size={16} />} />

        {isCameraOpen && permission?.granted && !capturedImageDataUrl ? (
          <PrimaryButton
            label={isCapturing ? "Capturing Photo..." : "Capture Photo"}
            onPress={handleCapturePhoto}
            disabled={isCapturing}
            icon={<CameraIcon color="#FFFFFF" size={16} />}
          />
        ) : null}

        {!permission?.granted && permission?.canAskAgain === false ? (
          <View style={styles.helpCard}>
            <Text style={styles.helpTitle}>Camera permission is blocked</Text>
            <Text style={styles.helpText}>
              {Platform.OS === "web"
                ? "Re-enable camera access for this site in your browser settings, then reload the page."
                : "Re-enable camera access for this app in your device settings, then return here."}
            </Text>
          </View>
        ) : null}

        {captureError ? (
          <View style={styles.helpCard}>
            <Text style={styles.helpTitle}>Photo capture needs another try</Text>
            <Text style={styles.helpText}>{captureError}</Text>
          </View>
        ) : null}

        <Card style={styles.formCard}>
          <Text style={styles.formTitle}>Log a scanned bottle</Text>
          <Text style={styles.formText}>
            Capture the bottle photo first, then enter the bottle name and plastic digit to save it.
          </Text>
          <TextInput
            value={productName}
            onChangeText={setProductName}
            placeholder="Example: Sparkling Water Bottle"
            placeholderTextColor="#96A1B4"
            style={styles.input}
          />
          <Text style={styles.digitLabel}>Plastic Digit</Text>
          <View style={styles.digitsRow}>
            {plasticDigits.map((digit) => {
              const selected = digit === selectedDigit;

              return (
                <Pressable
                  key={digit}
                  style={[styles.digitChip, selected && styles.digitChipSelected]}
                  onPress={() => setSelectedDigit(digit)}
                >
                  <Text style={[styles.digitChipText, selected && styles.digitChipTextSelected]}>{digit}</Text>
                </Pressable>
              );
            })}
          </View>
          <PrimaryButton
            label={isSubmittingScan ? "Saving Scan..." : "Save Scan"}
            onPress={handleSaveScan}
            disabled={
              isSubmittingScan || isCapturing || !productName.trim() || !selectedDigit || !capturedImageDataUrl
            }
            icon={<CameraIcon color="#FFFFFF" size={16} />}
          />
        </Card>

        <View style={styles.statsRow}>
          <StatCard value={`${stats.products}`} label="Products" valueColor={theme.colors.primary} />
          <StatCard value={`${stats.levelsUnlocked}/${stats.totalLevels}`} label="Levels" valueColor={theme.colors.success} />
          <StatCard value={`${stats.streakDays}`} label="Streak" valueColor={theme.colors.danger} />
        </View>

        <SectionTitle title="Recent Activity" />
        <Card style={styles.activityCard}>
          <Text style={styles.activityHeadline}>
            {latestScan ? latestScan.productName : `You have scanned ${stats.products} products so far.`}
          </Text>
          <Text style={styles.activityText}>
            {latestScan
              ? `Latest result: ${latestScan.plasticType} • ${latestScan.recyclable ? "Recyclable" : "Review local recycling guidance"} • ${latestScan.scannedAt}`
              : "Keep going to unlock the remaining plastic types and grow your eco-learning streak."}
          </Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 18,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: theme.typography.h2 + 6,
    fontWeight: "700",
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  previewCard: {
    padding: 4,
  },
  cameraTile: {
    height: 270,
    borderRadius: 14,
    backgroundColor: theme.colors.navy,
    borderWidth: 1,
    borderColor: "#33415D",
    overflow: "hidden",
  },
  cameraPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 10,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  placeholderText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    color: "#AEB9CD",
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(9, 14, 25, 0.18)",
  },
  capturedPreview: {
    ...StyleSheet.absoluteFillObject,
  },
  scanFrame: {
    width: 180,
    height: 180,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.78)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  overlayLabel: {
    marginTop: 18,
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  overlaySubLabel: {
    marginTop: 6,
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  helpCard: {
    borderRadius: 14,
    backgroundColor: "#EEF4FF",
    borderWidth: 1,
    borderColor: "#D7E3FF",
    padding: 14,
    gap: 6,
  },
  formCard: {
    padding: 16,
    gap: 12,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  formText: {
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.textMuted,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    fontSize: 14,
    color: theme.colors.text,
    backgroundColor: theme.colors.surfaceMuted,
  },
  digitLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
  },
  digitsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  digitChip: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceMuted,
  },
  digitChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  digitChipText: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.textMuted,
  },
  digitChipTextSelected: {
    color: "#FFFFFF",
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
  },
  helpText: {
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.textMuted,
  },
  activityCard: {
    padding: 18,
    gap: 10,
  },
  activityHeadline: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  activityText: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.textMuted,
  },
});
