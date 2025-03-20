import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Save, Camera } from "lucide-react-native";
import { useTheme } from "@/context/ThemeProvider";

export default function EditProfileScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();

  // Mock user data - in a real app, this would come from a database or context
  const [username, setUsername] = useState("AnimeUser");
  const [bio, setBio] = useState(
    "Anime enthusiast from Mongolia. I love shonen and slice of life anime!",
  );
  const [avatarUrl, setAvatarUrl] = useState(
    "https://api.dicebear.com/7.x/avataaars/svg?seed=AnimeUser",
  );

  // Handle back button press
  const handleBackPress = () => {
    router.back();
  };

  // Handle save profile
  const handleSaveProfile = () => {
    // In a real app, this would update the user profile in a database
    Alert.alert(
      "Profile Updated",
      "Your profile has been updated successfully",
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ],
    );
  };

  // Handle avatar change
  const handleAvatarChange = () => {
    // In a real app, this would open the image picker
    const newSeed = Math.random().toString(36).substring(7);
    setAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${newSeed}`);
    Alert.alert("Avatar Changed", "Your avatar has been updated");
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
            Edit Profile
          </Text>
          <TouchableOpacity onPress={handleSaveProfile}>
            <Save size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, padding: 16 }}>
          {/* Avatar Section */}
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <View style={{ position: "relative" }}>
              <Image
                source={{ uri: avatarUrl }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  borderWidth: 2,
                  borderColor: colors.primary,
                }}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: colors.primary,
                  borderRadius: 20,
                  padding: 8,
                }}
                onPress={handleAvatarChange}
              >
                <Camera size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Fields */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                color: colors.textSecondary,
                marginBottom: 8,
                fontSize: 14,
              }}
            >
              Username
            </Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              style={{
                backgroundColor: colors.card,
                borderRadius: 8,
                padding: 12,
                color: colors.text,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                color: colors.textSecondary,
                marginBottom: 8,
                fontSize: 14,
              }}
            >
              Bio
            </Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: colors.card,
                borderRadius: 8,
                padding: 12,
                color: colors.text,
                borderWidth: 1,
                borderColor: colors.border,
                textAlignVertical: "top",
                minHeight: 100,
              }}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              borderRadius: 8,
              padding: 16,
              alignItems: "center",
              marginTop: 16,
            }}
            onPress={handleSaveProfile}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>
              Save Changes
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
