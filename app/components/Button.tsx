import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
  Platform,
} from "react-native";
import { useTheme } from "@/context/ThemeProvider";
import Typography from "./Typography";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  accessibilityHint?: string;
  hapticFeedback?: "light" | "medium" | "heavy" | "none";
}

/**
 * Button component for consistent interactive elements
 * Supports various variants, sizes, and states with haptic feedback
 * and enhanced accessibility features
 */
export default function Button({
  title,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  disabled,
  accessibilityHint,
  hapticFeedback = "light",
  onPress,
  ...props
}: ButtonProps) {
  const { colors } = useTheme();

  // Determine background and text colors based on variant
  const getColors = () => {
    switch (variant) {
      case "primary":
        return {
          background: disabled ? colors.inactive : colors.primary,
          text: "#FFFFFF",
          border: "transparent",
        };
      case "secondary":
        return {
          background: disabled ? colors.inactive : colors.secondary,
          text: "#FFFFFF",
          border: "transparent",
        };
      case "outline":
        return {
          background: "transparent",
          text: disabled ? colors.inactive : colors.primary,
          border: disabled ? colors.inactive : colors.primary,
        };
      case "ghost":
        return {
          background: "transparent",
          text: disabled ? colors.inactive : colors.primary,
          border: "transparent",
        };
      default:
        return {
          background: disabled ? colors.inactive : colors.primary,
          text: "#FFFFFF",
          border: "transparent",
        };
    }
  };

  // Determine padding based on size
  const getPadding = () => {
    switch (size) {
      case "sm":
        return { paddingVertical: 8, paddingHorizontal: 14 };
      case "md":
        return { paddingVertical: 12, paddingHorizontal: 18 };
      case "lg":
        return { paddingVertical: 16, paddingHorizontal: 24 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 18 };
    }
  };

  // Get font size based on size
  const getFontSize = (): "button" | "bodySmall" | "body" => {
    switch (size) {
      case "sm":
        return "bodySmall";
      case "lg":
        return "body";
      default:
        return "button";
    }
  };

  // Handle press with haptic feedback
  const handlePress = (event: any) => {
    if (disabled || isLoading) return;

    // Trigger haptic feedback if enabled
    if (hapticFeedback !== "none") {
      try {
        const Haptics = require("expo-haptics");
        switch (hapticFeedback) {
          case "light":
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
          case "medium":
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case "heavy":
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
        }
      } catch (error) {
        // Haptics not available, continue silently
      }
    }

    // Call the original onPress handler
    if (onPress) {
      onPress(event);
    }
  };

  const { background, text, border } = getColors();
  const padding = getPadding();
  const fontSize = getFontSize();

  // Determine the appropriate accessibility role based on the button's purpose
  const getAccessibilityRole = () => {
    if (isLoading) return "progressbar";
    return "button";
  };

  // Generate appropriate accessibility state
  const getAccessibilityState = () => {
    return {
      disabled: disabled || isLoading,
      busy: isLoading,
    };
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled || isLoading}
      style={[
        styles.button,
        {
          backgroundColor: background,
          borderColor: border,
          borderWidth: variant === "outline" ? 1 : 0,
          width: fullWidth ? "100%" : "auto",
          opacity: disabled ? 0.7 : 1,
        },
        padding,
        style,
      ]}
      onPress={handlePress}
      accessibilityRole={getAccessibilityRole()}
      accessibilityState={getAccessibilityState()}
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint || `Activates ${title} action`}
      {...props}
    >
      <View style={styles.contentContainer}>
        {leftIcon && !isLoading && (
          <View style={styles.leftIcon}>{leftIcon}</View>
        )}

        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={text}
            accessibilityLabel="Loading"
          />
        ) : (
          <Typography variant={fontSize} color={text} weight="600">
            {title}
          </Typography>
        )}

        {rightIcon && !isLoading && (
          <View style={styles.rightIcon}>{rightIcon}</View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2.5,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  leftIcon: {
    marginRight: 10,
  },
  rightIcon: {
    marginLeft: 10,
  },
});
