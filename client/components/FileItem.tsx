import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import type { CodeFile } from "@/types";

interface FileItemProps {
  file: CodeFile;
  isActive: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FileItem({ file, isActive, onPress, onLongPress }: FileItemProps) {
  const scale = useSharedValue(1);
  const theme = Colors.dark;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getFileIcon = (filename: string): keyof typeof Feather.glyphMap => {
    const ext = filename.split(".").pop()?.toLowerCase();
    const iconMap: Record<string, keyof typeof Feather.glyphMap> = {
      js: "file-text",
      ts: "file-text",
      jsx: "file-text",
      tsx: "file-text",
      py: "file-text",
      pine: "trending-up",
      json: "file",
      html: "code",
      css: "eye",
      md: "file-text",
    };
    return iconMap[ext || ""] || "file";
  };

  const getFileColor = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase();
    const colorMap: Record<string, string> = {
      js: "#F7DF1E",
      ts: "#3178C6",
      jsx: "#61DAFB",
      tsx: "#61DAFB",
      py: "#3776AB",
      pine: "#4EC9B0",
      json: "#CE9178",
      html: "#E34F26",
      css: "#1572B6",
      md: "#858585",
    };
    return colorMap[ext || ""] || theme.text;
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => {
        scale.value = withSpring(0.98);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      style={[
        styles.container,
        {
          backgroundColor: isActive ? theme.backgroundSecondary : "transparent",
        },
        animatedStyle,
      ]}
    >
      <Feather
        name={getFileIcon(file.name)}
        size={18}
        color={getFileColor(file.name)}
        style={styles.icon}
      />
      <View style={styles.textContainer}>
        <ThemedText
          style={[
            styles.filename,
            isActive && { color: theme.primary },
          ]}
          numberOfLines={1}
        >
          {file.name}
        </ThemedText>
        <ThemedText style={styles.language} numberOfLines={1}>
          {file.language}
        </ThemedText>
      </View>
      {isActive && (
        <View style={[styles.activeIndicator, { backgroundColor: theme.primary }]} />
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginHorizontal: Spacing.sm,
    marginVertical: 2,
  },
  icon: {
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  filename: {
    fontSize: 14,
    fontWeight: "500",
  },
  language: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  activeIndicator: {
    width: 3,
    height: 24,
    borderRadius: 2,
    marginLeft: Spacing.sm,
  },
});
