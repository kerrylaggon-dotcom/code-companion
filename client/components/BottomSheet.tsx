import React, { useCallback, useEffect } from "react";
import { StyleSheet, View, Pressable, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  minHeight?: number;
  maxHeight?: number;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export function BottomSheet({
  isOpen,
  onClose,
  children,
  minHeight = SCREEN_HEIGHT * 0.4,
  maxHeight = SCREEN_HEIGHT * 0.7,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const theme = Colors.dark;
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const currentHeight = useSharedValue(minHeight);
  const context = useSharedValue({ y: 0 });

  useEffect(() => {
    if (isOpen) {
      translateY.value = withSpring(SCREEN_HEIGHT - minHeight, {
        damping: 20,
        stiffness: 150,
      });
    } else {
      translateY.value = withSpring(SCREEN_HEIGHT, {
        damping: 20,
        stiffness: 150,
      });
    }
  }, [isOpen, minHeight]);

  const scrollTo = useCallback(
    (destination: number) => {
      "worklet";
      translateY.value = withSpring(destination, {
        damping: 20,
        stiffness: 150,
      });
    },
    []
  );

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      const newY = context.value.y + event.translationY;
      translateY.value = Math.max(
        SCREEN_HEIGHT - maxHeight,
        Math.min(newY, SCREEN_HEIGHT)
      );
    })
    .onEnd((event) => {
      if (event.velocityY > 500 || translateY.value > SCREEN_HEIGHT - minHeight / 2) {
        scrollTo(SCREEN_HEIGHT);
        runOnJS(onClose)();
      } else if (event.velocityY < -500 || translateY.value < SCREEN_HEIGHT - (minHeight + maxHeight) / 2) {
        scrollTo(SCREEN_HEIGHT - maxHeight);
      } else {
        scrollTo(SCREEN_HEIGHT - minHeight);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: (SCREEN_HEIGHT - translateY.value) / minHeight * 0.5,
  }));

  if (!isOpen) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        style={[styles.backdrop, backdropAnimatedStyle]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: theme.backgroundDefault,
              height: maxHeight + insets.bottom,
              paddingBottom: insets.bottom,
            },
            animatedStyle,
          ]}
        >
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: theme.textSecondary }]} />
          </View>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
});
