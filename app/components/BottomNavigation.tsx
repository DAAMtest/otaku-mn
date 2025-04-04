import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import {
  Home,
  Clock,
  List,
  Download,
  User,
  MessageSquare,
} from "lucide-react-native";
// Import Haptics conditionally to avoid dependency issues
let Haptics: any = {
  impactAsync: () => Promise.resolve(),
  ImpactFeedbackStyle: { Light: null },
};

// We'll try to import the actual module only if it's available
try {
  if (Platform.OS !== "web") {
    // Dynamic import to avoid dependency issues
    import("expo-haptics")
      .then((module) => {
        Haptics = module;
      })
      .catch((err) => {
        console.log("Haptics not available", err);
      });
  }
} catch (error) {
  console.log("Error importing Haptics", error);
}

interface BottomNavigationProps {
  currentRoute?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const BottomNavigation = ({
  currentRoute = "",
  activeTab = "home",
  onTabChange = () => {},
}: BottomNavigationProps) => {
  const router = useRouter();
  const pathname = usePathname();

  // Update active tab based on current path
  useEffect(() => {
    const path = pathname.split("/")[1] || "";
    const tab = path || "home";
    if (tab !== activeTab) {
      onTabChange(tab);
    }
  }, [pathname, activeTab, onTabChange]);

  const handleTabPress = (route: string, tab: string) => {
    // Provide haptic feedback on tab press (mobile only)
    if (Platform.OS !== "web") {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.log("Haptics not available", error);
      }
    }

    if (currentRoute !== route) {
      router.push({
        pathname: route,
        params: { from: "tab" },
      });
    }
    onTabChange(tab);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => handleTabPress("/", "home")}
        accessibilityLabel="Home tab"
        accessibilityRole="button"
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
        accessibilityLabel="History tab"
        accessibilityRole="button"
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
        accessibilityLabel="My List tab"
        accessibilityRole="button"
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
        accessibilityLabel="Downloads tab"
        accessibilityRole="button"
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
        onPress={() => handleTabPress("/character-ai", "character-ai")}
        accessibilityLabel="AI Chat tab"
        accessibilityRole="button"
      >
        <MessageSquare
          size={24}
          color={activeTab === "character-ai" ? "#4F46E5" : "#9CA3AF"}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: activeTab === "character-ai" ? "#4F46E5" : "#9CA3AF" },
          ]}
        >
          AI Chat
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => handleTabPress("/profile", "profile")}
        accessibilityLabel="Profile tab"
        accessibilityRole="button"
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
