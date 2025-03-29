import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
  Platform,
  AccessibilityRole,
} from "react-native";
import { useTheme } from "@/context/ThemeProvider";

export type CardVariant = "elevated" | "outlined" | "filled";

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

/**
 * Card component for displaying content in a contained, styled container
 * Supports different variants and can be interactive when onPress is provided
 */
export default function Card({
  children,
  variant = "elevated",
  onPress,
  style,
  contentStyle,
  testID,
  accessibilityLabel,
  accessibilityHint,
}: CardProps) {
  const { colors, isDarkMode } = useTheme();

  // Get card styles based on variant
  const getCardStyles = () => {
    switch (variant) {
      case "elevated":
        return {
          backgroundColor: colors.card,
          borderWidth: 0,
          shadowColor: isDarkMode ? "rgba(64, 192, 87, 0.3)" : "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: isDarkMode ? 0.4 : 0.15,
          shadowRadius: 6,
          elevation: 4,
        };
      case "outlined":
        return {
          backgroundColor: colors.card,
          borderWidth: 2,
          borderColor: isDarkMode
            ? "rgba(64, 192, 87, 0.2)"
            : "rgba(43, 147, 72, 0.15)",
          shadowColor: "transparent",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0,
          shadowRadius: 0,
          elevation: 0,
        };
      case "filled":
        return {
          backgroundColor: isDarkMode
            ? "rgba(19, 47, 76, 0.9)"
            : "rgba(237, 242, 247, 0.9)",
          borderWidth: 0,
          shadowColor: "transparent",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0,
          shadowRadius: 0,
          elevation: 0,
        };
      default:
        return {
          backgroundColor: colors.card,
          borderWidth: 0,
          shadowColor: isDarkMode ? "rgba(64, 192, 87, 0.3)" : "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: isDarkMode ? 0.4 : 0.15,
          shadowRadius: 6,
          elevation: 4,
        };
    }
  };

  const cardStyles = getCardStyles();

  // Determine the component to render based on whether onPress is provided
  const CardComponent = onPress ? TouchableOpacity : View;

  // Get accessibility props based on whether the card is interactive
  const getAccessibilityProps = () => {
    if (onPress) {
      return {
        accessible: true,
        accessibilityRole: "button" as AccessibilityRole,
        accessibilityLabel: accessibilityLabel,
        accessibilityHint: accessibilityHint || "Activates this card",
      };
    }
    return {
      accessible: true,
      accessibilityRole: "none" as AccessibilityRole,
      accessibilityLabel: accessibilityLabel,
    };
  };

  const accessibilityProps = getAccessibilityProps();

  return (
    <CardComponent
      style={[styles.card, cardStyles, style]}
      onPress={onPress}
      activeOpacity={0.7}
      testID={testID}
      {...accessibilityProps}
    >
      <View style={[styles.content, contentStyle]}>{children}</View>
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: Platform.OS === "android" ? "hidden" : "visible",
    marginVertical: 10,
    marginHorizontal: 0,
  },
  content: {
    padding: 18,
  },
});
