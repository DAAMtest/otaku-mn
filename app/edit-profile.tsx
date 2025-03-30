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
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/auth/components/AuthModal";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Session } from "@supabase/supabase-js";

// Define user profile interface
interface UserProfile {
  id: string;
  email?: string;
  username?: string;
  nickname?: string;
  bio?: string;
  avatarUrl?: string;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const { user, session, isLoading: authLoading } = useAuth();
  const { updateProfile, fetchUserProfile } = useSupabaseAuth();
  
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Initialize form with user data when available
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.id && session) {
        const profile = await fetchUserProfile(user.id);
        if (profile) {
          setUsername(profile.username || user.email?.split('@')[0] || "");
          setNickname(profile.nickname || profile.username || "");
          setBio(profile.bio || "");
          setAvatarUrl(profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email || "user"}`);
        }
      } else if (!authLoading) {
        // Show auth modal if not authenticated
        setShowAuthModal(true);
      }
    };
    
    loadUserProfile();
  }, [user?.id, session, authLoading]);

  // Handle back button press
  const handleBackPress = () => {
    router.back();
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    if (!user?.id || !session) {
      Alert.alert("Error", "Please sign in to update your profile");
      setShowAuthModal(true);
      return;
    }

    if (!nickname.trim()) {
      Alert.alert("Error", "Nickname cannot be empty");
      return;
    }
    
    try {
      setLoading(true);
      
      const result = await updateProfile({
        nickname: nickname.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl
      });

      if (result.success) {
        // Refresh the profile data
        const updatedProfile = await fetchUserProfile(user.id);
        if (updatedProfile) {
          setNickname(updatedProfile.nickname || "");
          setBio(updatedProfile.bio || "");
          setAvatarUrl(updatedProfile.avatarUrl);
        }

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
      } else {
        throw new Error(result.error || "Failed to update profile");
      }
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

  // Handle auth modal close
  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    router.back();
  };

  // Handle successful login
  const handleLoginSuccess = async () => {
    setShowAuthModal(false);
    return Promise.resolve();
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
              Username (cannot be changed)
            </Text>
            <TextInput
              value={username}
              editable={false}
              style={{
                backgroundColor: colors.card,
                borderRadius: 8,
                padding: 12,
                color: colors.textSecondary,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: 0.7,
              }}
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
              Nickname
            </Text>
            <TextInput
              value={nickname}
              onChangeText={setNickname}
              style={{
                backgroundColor: colors.card,
                borderRadius: 8,
                padding: 12,
                color: colors.text,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              placeholderTextColor={colors.textSecondary}
              placeholder="Enter your display name"
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
                textAlignVertical: 'top',
                minHeight: 100,
              }}
              placeholderTextColor={colors.textSecondary}
              placeholder="Write something about yourself..."
            />
          </View>
        </ScrollView>

        {/* Auth Modal */}
        <AuthModal
          visible={showAuthModal}
          onClose={handleAuthModalClose}
          onLogin={handleLoginSuccess}
        />
      </View>
    </SafeAreaView>
  );
}
