import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import { useTheme } from "@/context/ThemeProvider";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle back button press
  const handleBackPress = () => {
    router.back();
  };

  // Handle password change
  const handleChangePassword = () => {
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }

    // Simulate password change
    Alert.alert("Success", "Your password has been changed successfully", [
      { text: "OK", onPress: () => router.back() },
    ]);
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
            Change Password
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={{ flex: 1, padding: 16 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 14,
              marginBottom: 24,
            }}
          >
            Create a new password that is at least 8 characters long. A strong
            password contains a combination of letters, numbers, and special
            characters.
          </Text>

          {/* Current Password */}
          <Text
            style={{
              color: colors.text,
              fontSize: 16,
              fontWeight: "500",
              marginBottom: 8,
            }}
          >
            Current Password
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              marginBottom: 16,
              backgroundColor: colors.card,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                color: colors.text,
                padding: 12,
              }}
              placeholder="Enter current password"
              placeholderTextColor={colors.text + "80"}
              secureTextEntry={!showCurrentPassword}
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TouchableOpacity
              style={{ padding: 12 }}
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? (
                <EyeOff size={20} color={colors.text} />
              ) : (
                <Eye size={20} color={colors.text} />
              )}
            </TouchableOpacity>
          </View>

          {/* New Password */}
          <Text
            style={{
              color: colors.text,
              fontSize: 16,
              fontWeight: "500",
              marginBottom: 8,
            }}
          >
            New Password
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              marginBottom: 16,
              backgroundColor: colors.card,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                color: colors.text,
                padding: 12,
              }}
              placeholder="Enter new password"
              placeholderTextColor={colors.text + "80"}
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity
              style={{ padding: 12 }}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <EyeOff size={20} color={colors.text} />
              ) : (
                <Eye size={20} color={colors.text} />
              )}
            </TouchableOpacity>
          </View>

          {/* Confirm New Password */}
          <Text
            style={{
              color: colors.text,
              fontSize: 16,
              fontWeight: "500",
              marginBottom: 8,
            }}
          >
            Confirm New Password
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              marginBottom: 24,
              backgroundColor: colors.card,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                color: colors.text,
                padding: 12,
              }}
              placeholder="Confirm new password"
              placeholderTextColor={colors.text + "80"}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              style={{ padding: 12 }}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color={colors.text} />
              ) : (
                <Eye size={20} color={colors.text} />
              )}
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              padding: 16,
              borderRadius: 8,
              alignItems: "center",
              marginTop: 16,
            }}
            onPress={handleChangePassword}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Update Password
            </Text>
          </TouchableOpacity>

          {/* Bottom padding */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
