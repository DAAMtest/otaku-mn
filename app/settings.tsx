import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Moon,
  Bell,
  Globe,
  Shield,
  HelpCircle,
  Info,
  Trash2,
} from "lucide-react-native";
import { useTheme } from "@/context/ThemeProvider";

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [downloadOnWifiOnly, setDownloadOnWifiOnly] = useState(true);

  // Handle back button press
  const handleBackPress = () => {
    router.back();
  };

  // Handle option press
  const handleOptionPress = (option: string) => {
    switch (option) {
      case "Privacy Settings":
        router.push("/privacy-settings");
        break;
      case "Change Password":
        router.push("/change-password");
        break;
      case "Help Center":
        router.push("/help-center");
        break;
      case "About":
        router.push("/about");
        break;
      default:
        Alert.alert(option, `${option} settings will be implemented soon`);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => {
            Alert.alert(
              "Account Deleted",
              "Your account has been deleted successfully",
            );
            router.replace("/");
          },
          style: "destructive",
        },
      ],
    );
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
            Settings
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={{ flex: 1 }}>
          {/* Appearance Section */}
          <View style={{ padding: 16 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: 16,
              }}
            >
              Appearance
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 12,
                backgroundColor: colors.card,
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Moon size={20} color={colors.primary} />
                <Text style={{ color: colors.text, marginLeft: 12 }}>
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: "#767577", true: colors.primary }}
                thumbColor={"#f4f3f4"}
              />
            </View>
          </View>

          {/* Notifications Section */}
          <View style={{ padding: 16 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: 16,
              }}
            >
              Notifications
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 12,
                backgroundColor: colors.card,
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Bell size={20} color={colors.primary} />
                <Text style={{ color: colors.text, marginLeft: 12 }}>
                  Push Notifications
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#767577", true: colors.primary }}
                thumbColor={"#f4f3f4"}
              />
            </View>
          </View>

          {/* Playback Settings */}
          <View style={{ padding: 16 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: 16,
              }}
            >
              Playback & Downloads
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 12,
                backgroundColor: colors.card,
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ color: colors.text, marginLeft: 12 }}>
                  Autoplay Next Episode
                </Text>
              </View>
              <Switch
                value={autoplayEnabled}
                onValueChange={setAutoplayEnabled}
                trackColor={{ false: "#767577", true: colors.primary }}
                thumbColor={"#f4f3f4"}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 12,
                backgroundColor: colors.card,
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Globe size={20} color={colors.primary} />
                <Text style={{ color: colors.text, marginLeft: 12 }}>
                  Download on Wi-Fi Only
                </Text>
              </View>
              <Switch
                value={downloadOnWifiOnly}
                onValueChange={setDownloadOnWifiOnly}
                trackColor={{ false: "#767577", true: colors.primary }}
                thumbColor={"#f4f3f4"}
              />
            </View>
          </View>

          {/* Account & Privacy */}
          <View style={{ padding: 16 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: 16,
              }}
            >
              Account & Privacy
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
              onPress={() => handleOptionPress("Privacy Settings")}
            >
              <Shield size={20} color={colors.primary} />
              <Text style={{ color: colors.text, marginLeft: 12, flex: 1 }}>
                Privacy Settings
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
              onPress={() => handleOptionPress("Change Password")}
            >
              <Text style={{ color: colors.text, marginLeft: 12, flex: 1 }}>
                Change Password
              </Text>
            </TouchableOpacity>
          </View>

          {/* Help & Support */}
          <View style={{ padding: 16 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: 16,
              }}
            >
              Help & Support
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
              onPress={() => handleOptionPress("Help Center")}
            >
              <HelpCircle size={20} color={colors.primary} />
              <Text style={{ color: colors.text, marginLeft: 12, flex: 1 }}>
                Help Center
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
              onPress={() => handleOptionPress("About")}
            >
              <Info size={20} color={colors.primary} />
              <Text style={{ color: colors.text, marginLeft: 12, flex: 1 }}>
                About
              </Text>
            </TouchableOpacity>
          </View>

          {/* Danger Zone */}
          <View style={{ padding: 16 }}>
            <Text
              style={{
                color: colors.error,
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: 16,
              }}
            >
              Danger Zone
            </Text>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 12,
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                borderRadius: 8,
                marginBottom: 12,
              }}
              onPress={handleDeleteAccount}
            >
              <Trash2 size={20} color={colors.error} />
              <Text
                style={{
                  color: colors.error,
                  marginLeft: 12,
                  flex: 1,
                  fontWeight: "500",
                }}
              >
                Delete Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bottom padding */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
