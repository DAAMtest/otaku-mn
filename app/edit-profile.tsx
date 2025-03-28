import React, { useState, useEffect } from "react";
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
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Save, Camera } from "lucide-react-native";
import { useTheme } from "@/context/ThemeProvider";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

export default function EditProfileScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const { user, updateProfile, loading: authLoading } = useSupabaseAuth();
  
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  // Initialize form with user data when available
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setBio(user.bio || "");
      setAvatarUrl(user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || "user"}`);
    }
  }, [user]);

  // Handle back button press
  const handleBackPress = () => {
    router.back();
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Username cannot be empty");
      return;
    }
    
    try {
      setLoading(true);
      
      const { success, error } = await updateProfile({
        username,
        bio,
        avatar_url: avatarUrl,
      });
      
      if (!success) throw error;
      
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
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle avatar change
  const handleAvatarChange = () => {
    // Generate a new random avatar using DiceBear
    const newSeed = Math.random().toString(36).substring(7);
    setAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${newSeed}`);
    Alert.alert("Avatar Changed", "Your avatar has been updated");
  };
  
  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar
          barStyle={isDarkMode ? "light-content" : "dark-content"}
          backgroundColor={colors.background}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.text, marginTop: 16 }}>Loading profile data...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar
          barStyle={isDarkMode ? "light-content" : "dark-content"}
          backgroundColor={colors.background}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: colors.text, fontSize: 18, marginBottom: 20, textAlign: 'center' }}>
            Please sign in to edit your profile
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              borderRadius: 8,
              paddingHorizontal: 20,
              paddingVertical: 12,
            }}
            onPress={() => router.push("/auth/login")}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>
              Go to Login
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
          <TouchableOpacity onPress={handleSaveProfile} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Save size={24} color={colors.primary} />
            )}
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
              placeholder="Enter your username"
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
              placeholder="Tell us about yourself..."
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
              opacity: loading ? 0.7 : 1,
            }}
            onPress={handleSaveProfile}
            disabled={loading}
          >
            {loading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={{ color: "#FFFFFF", fontWeight: "bold", marginLeft: 8 }}>
                  Saving...
                </Text>
              </View>
            ) : (
              <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>
                Save Changes
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
