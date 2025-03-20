import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Github, Globe, Mail } from "lucide-react-native";
import { useTheme } from "@/context/ThemeProvider";
import Constants from "expo-constants";

export default function AboutScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const appVersion = Constants.expoConfig?.version || "1.0.0";

  // Handle back button press
  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            width: "100%",
            height: 60,
            backgroundColor: colors.background,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <TouchableOpacity onPress={handleBackPress}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text
            style={{ color: colors.text, fontWeight: "bold", fontSize: 18 }}
          >
            About
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={{ flex: 1 }}>
          {/* App Logo and Version */}
          <View
            style={{
              alignItems: "center",
              padding: 32,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Image
              source={require("../assets/images/icon.png")}
              style={{
                width: 100,
                height: 100,
                borderRadius: 20,
                marginBottom: 16,
              }}
            />
            <Text
              style={{
                color: colors.text,
                fontSize: 24,
                fontWeight: "bold",
                marginBottom: 8,
              }}
            >
              AnimeApp
            </Text>
            <Text style={{ color: colors.text, marginBottom: 8 }}>
              Version {appVersion}
            </Text>
            <Text
              style={{
                color: colors.text,
                textAlign: "center",
                paddingHorizontal: 32,
              }}
            >
              Your ultimate anime streaming companion with a vast library of
              titles, personalized recommendations, and a seamless viewing
              experience.
            </Text>
          </View>

          {/* App Information */}
          <View style={{ padding: 16 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 16,
              }}
            >
              App Information
            </Text>

            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 8,
                marginBottom: 16,
                padding: 16,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: 16,
                  marginBottom: 8,
                  fontWeight: "500",
                }}
              >
                Features
              </Text>
              <Text style={{ color: colors.text, marginBottom: 8 }}>
                • Stream thousands of anime titles
              </Text>
              <Text style={{ color: colors.text, marginBottom: 8 }}>
                • Create personalized watchlists
              </Text>
              <Text style={{ color: colors.text, marginBottom: 8 }}>
                • Download episodes for offline viewing
              </Text>
              <Text style={{ color: colors.text, marginBottom: 8 }}>
                • Get notifications for new episodes
              </Text>
              <Text style={{ color: colors.text }}>
                • Sync your watching progress across devices
              </Text>
            </View>
          </View>

          {/* Contact & Links */}
          <View style={{ padding: 16 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 16,
              }}
            >
              Contact & Links
            </Text>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 12,
                backgroundColor: colors.card,
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <Globe size={20} color={colors.primary} />
              <Text style={{ color: colors.text, marginLeft: 12, flex: 1 }}>
                Website
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 12,
                backgroundColor: colors.card,
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <Mail size={20} color={colors.primary} />
              <Text style={{ color: colors.text, marginLeft: 12, flex: 1 }}>
                Contact Support
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 12,
                backgroundColor: colors.card,
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <Github size={20} color={colors.primary} />
              <Text style={{ color: colors.text, marginLeft: 12, flex: 1 }}>
                GitHub Repository
              </Text>
            </TouchableOpacity>
          </View>

          {/* Legal */}
          <View style={{ padding: 16 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 16,
              }}
            >
              Legal
            </Text>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 12,
                backgroundColor: colors.card,
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: colors.text, flex: 1 }}>
                Terms of Service
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 12,
                backgroundColor: colors.card,
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: colors.text, flex: 1 }}>
                Privacy Policy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 12,
                backgroundColor: colors.card,
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: colors.text, flex: 1 }}>Licenses</Text>
            </TouchableOpacity>
          </View>

          {/* Credits */}
          <View style={{ padding: 16 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 16,
              }}
            >
              Credits
            </Text>

            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 8,
                padding: 16,
              }}
            >
              <Text style={{ color: colors.text, marginBottom: 8 }}>
                Built with React Native and Expo
              </Text>
              <Text style={{ color: colors.text, marginBottom: 8 }}>
                Icons by Lucide Icons
              </Text>
              <Text style={{ color: colors.text }}>
                © 2024 AnimeApp. All rights reserved.
              </Text>
            </View>
          </View>

          {/* Bottom padding */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
