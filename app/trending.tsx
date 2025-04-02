import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import BottomNavigation from "./components/BottomNavigation";
import FilterBar from "./components/FilterBar";
import TrendingAnime from "./components/TrendingAnime";
import { useAuth } from "./context/AuthContext";
import AuthModal from "./auth/components/AuthModal";

interface FilterOption {
  id: string;
  label: string;
  icon: string;
}

const TrendingScreen = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("home");

  const filterOptions: FilterOption[] = [
    { id: "all", label: "All", icon: "tag" },
    { id: "today", label: "Today", icon: "calendar" },
    { id: "this-week", label: "This Week", icon: "calendar" },
    { id: "this-month", label: "This Month", icon: "calendar" },
    { id: "this-year", label: "This Year", icon: "calendar" },
  ];

  const handleFilterPress = (option: FilterOption) => {
    setSelectedFilters((prev) =>
      prev.includes(option.id)
        ? prev.filter((id) => id !== option.id)
        : [...prev, option.id],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#171717" />
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Trending Anime</Text>
          <View style={{ width: 40 }} /> {/* Empty view for balance */}
        </View>

        <FilterBar
          options={filterOptions}
          selectedOptions={selectedFilters}
          onOptionPress={handleFilterPress}
          isLoading={false}
        />

        <View style={styles.animeContainer}>
          <TrendingAnime numColumns={2} showHeader={false} />
        </View>

        <BottomNavigation
          currentRoute="/trending"
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            switch (tab) {
              case "home":
                router.push("/");
                break;
              case "history":
                router.push("/history");
                break;
              case "lists":
                router.push("/lists");
                break;
              case "downloads":
                router.push("/downloads");
                break;
              case "profile":
                router.push("/profile");
                break;
            }
          }}
        />

        {false && <AuthModal visible={false} onClose={() => {}} />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#171717",
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#171717",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2A2A2A",
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 16,
    textAlign: "center",
  },
  animeContainer: {
    flex: 1,
    paddingBottom: 70,
  },
});

export default TrendingScreen;
