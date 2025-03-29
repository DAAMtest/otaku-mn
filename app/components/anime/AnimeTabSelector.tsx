import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Typography from "@/components/Typography";

type TabType = "episodes" | "related";

interface AnimeTabSelectorProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

/**
 * AnimeTabSelector component displays tabs for episodes and related anime
 */
export default function AnimeTabSelector({
  activeTab,
  onTabChange,
}: AnimeTabSelectorProps) {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "episodes" && styles.activeTabButton,
        ]}
        onPress={() => onTabChange("episodes")}
      >
        <Typography
          variant="button"
          style={[
            styles.tabButtonText,
            activeTab === "episodes" && styles.activeTabButtonText,
          ]}
        >
          Episodes
        </Typography>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "related" && styles.activeTabButton,
        ]}
        onPress={() => onTabChange("related")}
      >
        <Typography
          variant="button"
          style={[
            styles.tabButtonText,
            activeTab === "related" && styles.activeTabButtonText,
          ]}
        >
          Related Anime
        </Typography>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    marginTop: 24,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  tabButtonText: {
    fontSize: 14,
  },
  activeTabButton: {
    backgroundColor: "#6200ee",
  },
  activeTabButtonText: {
    color: "#fff",
  },
});
