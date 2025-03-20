import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Shield, Eye, Lock } from "lucide-react-native";
import { useTheme } from "@/context/ThemeProvider";

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const [locationSharing, setLocationSharing] = useState(false);
  const [dataCollection, setDataCollection] = useState(true);
  const [activityVisibility, setActivityVisibility] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState(true);

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
            Privacy Settings
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={{ flex: 1 }}>
          {/* Privacy Section */}
          <View style={{ padding: 16 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: 16,
              }}
            >
              Privacy Controls
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
                <Eye size={20} color={colors.primary} />
                <Text style={{ color: colors.text, marginLeft: 12 }}>
                  Profile Visibility
                </Text>
              </View>
              <Switch
                value={profileVisibility}
                onValueChange={setProfileVisibility}
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
                <Eye size={20} color={colors.primary} />
                <Text style={{ color: colors.text, marginLeft: 12 }}>
                  Activity Visibility
                </Text>
              </View>
              <Switch
                value={activityVisibility}
                onValueChange={setActivityVisibility}
                trackColor={{ false: "#767577", true: colors.primary }}
                thumbColor={"#f4f3f4"}
              />
            </View>
          </View>

          {/* Data Section */}
          <View style={{ padding: 16 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: 16,
              }}
            >
              Data & Permissions
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
                <Shield size={20} color={colors.primary} />
                <Text style={{ color: colors.text, marginLeft: 12 }}>
                  Data Collection
                </Text>
              </View>
              <Switch
                value={dataCollection}
                onValueChange={setDataCollection}
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
                <Lock size={20} color={colors.primary} />
                <Text style={{ color: colors.text, marginLeft: 12 }}>
                  Location Sharing
                </Text>
              </View>
              <Switch
                value={locationSharing}
                onValueChange={setLocationSharing}
                trackColor={{ false: "#767577", true: colors.primary }}
                thumbColor={"#f4f3f4"}
              />
            </View>
          </View>

          {/* Privacy Policy */}
          <View style={{ padding: 16 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
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
              <Text style={{ color: colors.text, marginLeft: 12, flex: 1 }}>
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
              <Text style={{ color: colors.text, marginLeft: 12, flex: 1 }}>
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
              <Text style={{ color: colors.text, marginLeft: 12, flex: 1 }}>
                Data Deletion Request
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
