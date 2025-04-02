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
import NewReleasesAnime from "./components/NewReleasesAnime";
import { useAuth } from "./context/AuthContext";
import AuthModal from "./auth/components/AuthModal";
import type { Database } from "@/lib/database.types";

// Define the Anime type to match AnimeGrid's expected type
type Tables = Database["public"]["Tables"];
type AnimeGridItem = Tables["anime"]["Row"] & {
  isFavorite?: boolean;
  genres?: string[];
  type?: string;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#171717",
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
  content: {
    flex: 1,
    paddingBottom: 70,
  },
});

const NewReleasesScreen = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("home");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#171717" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>New Releases</Text>
        <View style={{ width: 40 }} /> {/* Empty view for balance */}
      </View>

      {/* Main content */}
      <View style={styles.content}>
        <NewReleasesAnime numColumns={2} showHeader={false} />
      </View>

      {/* Bottom navigation */}
      <BottomNavigation
        currentRoute="/new-releases"
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

      {/* Auth modal */}
      {isLoading && <AuthModal visible={isLoading} onClose={() => {}} />}
    </SafeAreaView>
  );
};

export default NewReleasesScreen;
