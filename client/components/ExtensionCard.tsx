import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import type { Extension } from "@/types";

interface ExtensionCardProps {
  extension: Extension;
  onToggleInstall: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ExtensionCard({ extension, onToggleInstall }: ExtensionCardProps) {
  const scale = useSharedValue(1);
  const theme = Colors.dark;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getCategoryColor = (category: Extension["category"]): string => {
    const colors: Record<Extension["category"], string> = {
      language: theme.secondary,
      theme: "#C586C0",
      formatter: theme.primary,
      utility: theme.warning,
    };
    return colors[category];
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleInstall();
  };

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.98);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      style={[
        styles.container,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: getCategoryColor(extension.category) + "20" },
          ]}
        >
          <Feather
            name={extension.icon as keyof typeof Feather.glyphMap}
            size={24}
            color={getCategoryColor(extension.category)}
          />
        </View>
        <View style={styles.info}>
          <ThemedText style={styles.name} numberOfLines={1}>
            {extension.name}
          </ThemedText>
          <ThemedText style={styles.author} numberOfLines={1}>
            {extension.author} • v{extension.version}
          </ThemedText>
        </View>
      </View>
      
      <ThemedText style={styles.description} numberOfLines={2}>
        {extension.description}
      </ThemedText>
      
      {extension.features && extension.features.length > 0 && (
        <View style={styles.features}>
          {extension.features.slice(0, 3).map((feature, index) => (
            <View
              key={index}
              style={[
                styles.featureTag,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <ThemedText style={styles.featureText}>{feature}</ThemedText>
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.footer}>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: getCategoryColor(extension.category) + "30" },
          ]}
        >
          <ThemedText
            style={[styles.categoryText, { color: getCategoryColor(extension.category) }]}
          >
            {extension.category}
          </ThemedText>
        </View>
        
        <Pressable
          onPress={handlePress}
          style={[
            styles.installButton,
            {
              backgroundColor: extension.installed
                ? theme.backgroundSecondary
                : theme.buttonBackground,
            },
          ]}
        >
          <Feather
            name={extension.installed ? "check" : "download"}
            size={16}
            color={extension.installed ? theme.primary : theme.buttonText}
          />
          <ThemedText
            style={[
              styles.installText,
              { color: extension.installed ? theme.text : theme.buttonText },
            ]}
          >
            {extension.installed ? "Installed" : "Install"}
          </ThemedText>
        </Pressable>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  author: {
    fontSize: 12,
    opacity: 0.6,
  },
  description: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  features: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: Spacing.md,
  },
  featureTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  featureText: {
    fontSize: 11,
    opacity: 0.8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  installButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  installText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: Spacing.xs,
  },
});
