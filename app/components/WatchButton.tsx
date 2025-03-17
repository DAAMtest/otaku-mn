import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Play } from "lucide-react-native";
import { router } from "expo-router";
import Typography from "./Typography";
import { useTheme } from "@/context/ThemeProvider";

interface WatchButtonProps {
  animeId: string;
  episodeId?: string;
  label?: string;
  size?: "small" | "medium" | "large";
  style?: any;
}

/**
 * WatchButton component for navigating to the watch screen
 */
const WatchButton = ({
  animeId,
  episodeId = "1",
  label = "Watch Now",
  size = "medium",
  style,
}: WatchButtonProps) => {
  const { colors } = useTheme();

  const handlePress = () => {
    router.push({
      pathname: "/watch",
      params: { animeId, episodeId },
    });
  };

  // Size configurations
  const sizeStyles = {
    small: {
      button: { height: 36, paddingHorizontal: 12 },
      icon: 16,
      text: "caption",
    },
    medium: {
      button: { height: 44, paddingHorizontal: 16 },
      icon: 20,
      text: "bodySmall",
    },
    large: {
      button: { height: 52, paddingHorizontal: 20 },
      icon: 24,
      text: "body",
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: colors.primary },
        currentSize.button,
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Play
        size={currentSize.icon}
        color="white"
        fill="white"
        style={styles.icon}
      />
      <Typography variant={currentSize.text as any} color="white" weight="600">
        {label}
      </Typography>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  icon: {
    marginRight: 8,
  },
});

export default WatchButton;
