import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Home, Clock, List, Download, User } from "lucide-react-native";

interface BottomNavigationProps {
  currentRoute: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation = ({
  currentRoute,
  activeTab,
  onTabChange,
}: BottomNavigationProps) => {
  const router = useRouter();

  const handleTabPress = (route: string, tab: string) => {
    if (currentRoute !== route) {
      router.push(route);
    }
    onTabChange(tab);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => handleTabPress("/", "home")}
      >
        <Home size={24} color={activeTab === "home" ? "#4F46E5" : "#9CA3AF"} />
        <Text
          style={[
            styles.tabLabel,
            { color: activeTab === "home" ? "#4F46E5" : "#9CA3AF" },
          ]}
        >
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => handleTabPress("/history", "history")}
      >
        <Clock
          size={24}
          color={activeTab === "history" ? "#4F46E5" : "#9CA3AF"}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: activeTab === "history" ? "#4F46E5" : "#9CA3AF" },
          ]}
        >
          History
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => handleTabPress("/lists", "lists")}
      >
        <List size={24} color={activeTab === "lists" ? "#4F46E5" : "#9CA3AF"} />
        <Text
          style={[
            styles.tabLabel,
            { color: activeTab === "lists" ? "#4F46E5" : "#9CA3AF" },
          ]}
        >
          My List
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => handleTabPress("/downloads", "downloads")}
      >
        <Download
          size={24}
          color={activeTab === "downloads" ? "#4F46E5" : "#9CA3AF"}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: activeTab === "downloads" ? "#4F46E5" : "#9CA3AF" },
          ]}
        >
          Downloads
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => handleTabPress("/profile", "profile")}
      >
        <User
          size={24}
          color={activeTab === "profile" ? "#4F46E5" : "#9CA3AF"}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: activeTab === "profile" ? "#4F46E5" : "#9CA3AF" },
          ]}
        >
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#171717",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderTopWidth: 1,
    borderTopColor: "#333333",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default BottomNavigation;
