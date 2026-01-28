import React from "react";
import { StyleSheet, Pressable, View, Switch } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface SettingsItemProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  value?: string | number | boolean;
  onPress?: () => void;
  type?: "toggle" | "select" | "action";
}

export function SettingsItem({
  icon,
  title,
  subtitle,
  value,
  onPress,
  type = "action",
}: SettingsItemProps) {
  const theme = Colors.dark;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable
      onPress={type !== "toggle" ? handlePress : undefined}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: theme.backgroundDefault },
        pressed && type !== "toggle" && { opacity: 0.8 },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.backgroundSecondary }]}>
        <Feather name={icon} size={20} color={theme.primary} />
      </View>
      
      <View style={styles.content}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {subtitle ? (
          <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
        ) : null}
      </View>
      
      {type === "toggle" && typeof value === "boolean" && (
        <Switch
          value={value}
          onValueChange={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPress?.();
          }}
          trackColor={{
            false: theme.backgroundSecondary,
            true: theme.primary + "80",
          }}
          thumbColor={value ? theme.primary : theme.text}
        />
      )}
      
      {type === "select" && (
        <View style={styles.selectContainer}>
          <ThemedText style={styles.selectValue}>{String(value)}</ThemedText>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </View>
      )}
      
      {type === "action" && (
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 2,
  },
  selectContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectValue: {
    fontSize: 14,
    opacity: 0.6,
    marginRight: Spacing.sm,
  },
});
