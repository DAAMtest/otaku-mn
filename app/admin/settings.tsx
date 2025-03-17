import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Save,
  Globe,
  Shield,
  Bell,
  Clock,
  Database,
  Server,
  RefreshCw,
  Trash2,
  FileJson,
} from "lucide-react-native";
import { supabase } from "../lib/supabase";

interface AppSettings {
  maintenance_mode: boolean;
  allow_new_registrations: boolean;
  default_user_role: string;
  notification_frequency: string;
  cache_duration: number;
  api_rate_limit: number;
  content_moderation: boolean;
  auto_backup: boolean;
  theme_color: string;
  app_version: string;
}

export default function AdminSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    maintenance_mode: false,
    allow_new_registrations: true,
    default_user_role: "user",
    notification_frequency: "daily",
    cache_duration: 60,
    api_rate_limit: 100,
    content_moderation: true,
    auto_backup: true,
    theme_color: "#8B5CF6",
    app_version: "1.0.0",
  });

  // Fetch settings on component mount
  useEffect(() => {
    // In a real app, you would fetch settings from the database
    // For this demo, we'll just simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  // Handle back button press
  const handleBackPress = () => {
    router.back();
  };

  // Handle save settings
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // In a real app, you would save settings to the database
      // For this demo, we'll just simulate saving
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert("Success", "Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      Alert.alert("Error", "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Handle reset settings
  const handleResetSettings = () => {
    Alert.alert(
      "Reset Settings",
      "Are you sure you want to reset all settings to default values?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          onPress: () => {
            setSettings({
              maintenance_mode: false,
              allow_new_registrations: true,
              default_user_role: "user",
              notification_frequency: "daily",
              cache_duration: 60,
              api_rate_limit: 100,
              content_moderation: true,
              auto_backup: true,
              theme_color: "#8B5CF6",
              app_version: "1.0.0",
            });
            Alert.alert("Success", "Settings reset to default values");
          },
          style: "destructive",
        },
      ]
    );
  };

  // Handle export settings
  const handleExportSettings = () => {
    Alert.alert(
      "Export Settings",
      "Settings would be exported as JSON in a real app.",
      [{ text: "OK" }]
    );
  };

  // Handle import settings
  const handleImportSettings = () => {
    Alert.alert(
      "Import Settings",
      "Settings would be imported from JSON in a real app.",
      [{ text: "OK" }]
    );
  };

  // Handle database backup
  const handleDatabaseBackup = () => {
    Alert.alert(
      "Database Backup",
      "This would trigger a database backup in a real app.",
      [{ text: "OK" }]
    );
  };

  // Handle clear cache
  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "This would clear the application cache in a real app.",
      [{ text: "OK" }]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <StatusBar barStyle="light-content" backgroundColor="#111827" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366F1" />
          <Text className="text-gray-400 mt-4">Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <View className="flex-1">
        {/* Header */}
        <View className="w-full h-[60px] bg-gray-900 flex-row items-center justify-between px-4 border-b border-gray-800">
          <TouchableOpacity onPress={handleBackPress}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Admin Settings</Text>
          <TouchableOpacity onPress={handleSaveSettings} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color="#6366F1" />
            ) : (
              <Save size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* App Settings Section */}
          <View className="mb-6">
            <Text className="text-white font-bold text-lg mb-4">
              Application Settings
            </Text>

            <View className="bg-gray-800 rounded-lg p-4 mb-4">
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                  <Shield size={20} color="#F87171" className="mr-2" />
                  <Text className="text-white">Maintenance Mode</Text>
                </View>
                <Switch
                  value={settings.maintenance_mode}
                  onValueChange={(value) =>
                    setSettings({ ...settings, maintenance_mode: value })
                  }
                  trackColor={{ false: "#3f3f46", true: "#ef4444" }}
                  thumbColor={settings.maintenance_mode ? "#ffffff" : "#d4d4d8"}
                />
              </View>

              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                  <Globe size={20} color="#60A5FA" className="mr-2" />
                  <Text className="text-white">Allow New Registrations</Text>
                </View>
                <Switch
                  value={settings.allow_new_registrations}
                  onValueChange={(value) =>
                    setSettings({ ...settings, allow_new_registrations: value })
                  }
                  trackColor={{ false: "#3f3f46", true: "#2563eb" }}
                  thumbColor={settings.allow_new_registrations ? "#ffffff" : "#d4d4d8"}
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-300 mb-1">Default User Role</Text>
                <View className="flex-row">
                  <TouchableOpacity
                    className={`flex-1 p-2 rounded-l-lg ${settings.default_user_role === "user" ? "bg-blue-600" : "bg-gray-700"}`}
                    onPress={() =>
                      setSettings({ ...settings, default_user_role: "user" })
                    }
                  >
                    <Text className="text-white text-center">User</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 p-2 ${settings.default_user_role === "moderator" ? "bg-blue-600" : "bg-gray-700"}`}
                    onPress={() =>
                      setSettings({ ...settings, default_user_role: "moderator" })
                    }
                  >
                    <Text className="text-white text-center">Moderator</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 p-2 rounded-r-lg ${settings.default_user_role === "admin" ? "bg-blue-600" : "bg-gray-700"}`}
                    onPress={() =>
                      setSettings({ ...settings, default_user_role: "admin" })
                    }
                  >
                    <Text className="text-white text-center">Admin</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-gray-300 mb-1">Theme Color</Text>
                <View className="flex-row">
                  {["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"].map(
                    (color) => (
                      <TouchableOpacity
                        key={color}
                        className={`w-10 h-10 rounded-full mx-1 ${settings.theme_color === color ? "border-2 border-white" : ""}`}
                        style={{ backgroundColor: color }}
                        onPress={() =>
                          setSettings({ ...settings, theme_color: color })
                        }
                      />
                    )
                  )}
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-gray-300 mb-1">App Version</Text>
                <TextInput
                  className="bg-gray-700 text-white px-3 py-2 rounded-lg"
                  value={settings.app_version}
                  onChangeText={(text) =>
                    setSettings({ ...settings, app_version: text })
                  }
                />
              </View>
            </View>
          </View>

          {/* Notification Settings */}
          <View className="mb-6">
            <Text className="text-white font-bold text-lg mb-4">
              Notification Settings
            </Text>

            <View className="bg-gray-800 rounded-lg p-4 mb-4">
              <View className="mb-4">
                <Text className="text-gray-300 mb-1">Notification Frequency</Text>
                <View className="flex-row">
                  <TouchableOpacity
                    className={`flex-1 p-2 rounded-l-lg ${settings.notification_frequency === "realtime" ? "bg-purple-600" : "bg-gray-700"}`}
                    onPress={() =>
                      setSettings({
                        ...settings,
                        notification_frequency: "realtime",
                      })
                    }
                  >
                    <Text className="text-white text-center">Real-time</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 p-2 ${settings.notification_frequency === "hourly" ? "bg-purple-600" : "bg-gray-700"}`}
                    onPress={() =>
                      setSettings({
                        ...settings,
                        notification_frequency: "hourly",
                      })
                    }
                  >
                    <Text className="text-white text-center">Hourly</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 p-2 ${settings.notification_frequency === "daily" ? "bg-purple-600" : "bg-gray-700"}`}
                    onPress={() =>
                      setSettings({
                        ...settings,
                        notification_frequency: "daily",
                      })
                    }
                  >
                    <Text className="text-white text-center">Daily</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 p-2 rounded-r-lg ${settings.notification_frequency === "weekly" ? "bg-purple-600" : "bg-gray-700"}`}
                    onPress={() =>
                      setSettings({
                        ...settings,
                        notification_frequency: "weekly",
                      })
                    }
                  >
                    <Text className="text-white text-center">Weekly</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Bell size={20} color="#A78BFA" className="mr-2" />
                  <Text className="text-white">Content Moderation</Text>
                </View>
                <Switch
                  value={settings.content_moderation}
                  onValueChange={(value) =>
                    setSettings({ ...settings, content_moderation: value })
                  }
                  trackColor={{ false: "#3f3f46", true: "#7c3aed" }}
                  thumbColor={settings.content_moderation ? "#ffffff" : "#d4d4d8"}
                />
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="space-y-4">
            <TouchableOpacity
              onPress={handleResetSettings}
              className="bg-red-500 p-4 rounded-lg flex-row items-center justify-center"
            >
              <RefreshCw size={20} color="#FFFFFF" className="mr-2" />
              <Text className="text-white font-semibold">Reset to Defaults</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleExportSettings}
              className="bg-blue-500 p-4 rounded-lg flex-row items-center justify-center"
            >
              <FileJson size={20} color="#FFFFFF" className="mr-2" />
              <Text className="text-white font-semibold">Export Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleImportSettings}
              className="bg-blue-500 p-4 rounded-lg flex-row items-center justify-center"
            >
              <FileJson size={20} color="#FFFFFF" className="mr-2" />
              <Text className="text-white font-semibold">Import Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDatabaseBackup}
              className="bg-green-500 p-4 rounded-lg flex-row items-center justify-center"
            >
              <Database size={20} color="#FFFFFF" className="mr-2" />
              <Text className="text-white font-semibold">Database Backup</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleClearCache}
              className="bg-yellow-500 p-4 rounded-lg flex-row items-center justify-center"
            >
              <Trash2 size={20} color="#FFFFFF" className="mr-2" />
              <Text className="text-white font-semibold">Clear Cache</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}