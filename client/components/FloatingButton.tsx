import React from "react";
import { StyleSheet, Pressable, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { Colors, Spacing } from "@/constants/theme";

interface FloatingButtonProps {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  style?: ViewStyle;
  size?: "small" | "medium" | "large";
  variant?: "primary" | "secondary";
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FloatingButton({
  icon,
  onPress,
  style,
  size = "medium",
  variant = "primary",
}: FloatingButtonProps) {
  const scale = useSharedValue(1);
  const theme = Colors.dark;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const sizeStyles = {
    small: { width: 44, height: 44, iconSize: 20 },
    medium: { width: 56, height: 56, iconSize: 24 },
    large: { width: 64, height: 64, iconSize: 28 },
  };

  const { width, height, iconSize } = sizeStyles[size];

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={() => {
        scale.value = withSpring(0.9);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      style={[
        styles.button,
        {
          width,
          height,
          borderRadius: width / 2,
          backgroundColor:
            variant === "primary" ? theme.buttonBackground : theme.backgroundSecondary,
        },
        style,
        animatedStyle,
      ]}
    >
      <Feather
        name={icon}
        size={iconSize}
        color={variant === "primary" ? theme.buttonText : theme.primary}
      />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
