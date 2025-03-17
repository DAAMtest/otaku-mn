import React, { useState } from "react";
import {
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput
} from "react-native";
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Github,
  Twitter,
} from "lucide-react-native";
import { cn } from "@/lib/utils";

interface AuthModalProps {
  visible?: boolean;
  onClose?: () => void;
  onLogin?: (email: string, password: string) => void;
  onRegister?: (email: string, password: string, username: string) => void;
  onSocialLogin?: (provider: string) => void;
}

/**
 * Authentication modal component for login and registration
 * 
 * @param props - Component props
 * @returns AuthModal component
 */
const AuthModal = React.memo(function AuthModal({
  visible = false,
  onClose = () => {},
  onLogin = () => {},
  onRegister = () => {},
  onSocialLogin = () => {},
}: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    // Basic validation
    if (isLogin) {
      if (!email.trim()) {
        Alert.alert("Error", "Please enter your email");
        return;
      }
      if (!password) {
        Alert.alert("Error", "Please enter your password");
        return;
      }
      onLogin(email, password);
    } else {
      if (!username.trim()) {
        Alert.alert("Error", "Please enter a username");
        return;
      }
      if (!email.trim()) {
        Alert.alert("Error", "Please enter your email");
        return;
      }
      if (password.length < 6) {
        Alert.alert("Error", "Password must be at least 6 characters");
        return;
      }
      onRegister(email, password, username);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
    setUsername("");
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center items-center"
        style={{ width: "100%" }}
      >
        <View className="flex-1 w-full justify-center items-center bg-black/50">
          <View className="w-[350px] bg-neutral-950 dark:bg-neutral-900 rounded-xl p-6 shadow-lg">
            {/* Header with close button */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-neutral-100 dark:text-white text-xl font-bold">
                {isLogin ? "Login" : "Create Account"}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="p-2 rounded-full bg-neutral-800 dark:bg-neutral-700"
                activeOpacity={0.7}
              >
                <X size={18} className="text-neutral-400 dark:text-neutral-300" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Form Fields */}
              <View className="mb-4">
                {!isLogin && (
                  <View className="mb-4">
                    <Text className="text-neutral-400 dark:text-neutral-300 text-sm mb-2">Username</Text>
                    <View className="flex-row items-center border border-neutral-800 dark:border-neutral-700 rounded-lg px-3 py-2 bg-neutral-900 dark:bg-neutral-800">
                      <TextInput
                        className="flex-1 text-neutral-100 dark:text-white"
                        placeholder="Your username"
                        placeholderTextColor="#6B7280"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                      />
                    </View>
                  </View>
                )}

                <View className="mb-4">
                  <Text className="text-neutral-400 dark:text-neutral-300 text-sm mb-2">Email</Text>
                  <View className="flex-row items-center border border-neutral-800 dark:border-neutral-700 rounded-lg px-3 py-2 bg-neutral-900 dark:bg-neutral-800">
                    <Mail size={18} className="text-neutral-500 dark:text-neutral-400" />
                    <TextInput
                      className="flex-1 ml-2 text-neutral-100 dark:text-white"
                      placeholder="your.email@example.com"
                      placeholderTextColor="#6B7280"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View className="mb-6">
                  <Text className="text-neutral-400 dark:text-neutral-300 text-sm mb-2">Password</Text>
                  <View className="flex-row items-center border border-neutral-800 dark:border-neutral-700 rounded-lg px-3 py-2 bg-neutral-900 dark:bg-neutral-800">
                    <Lock size={18} className="text-neutral-500 dark:text-neutral-400" />
                    <TextInput
                      className="flex-1 ml-2 text-neutral-100 dark:text-white"
                      placeholder="Your password"
                      placeholderTextColor="#6B7280"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      activeOpacity={0.7}
                    >
                      {showPassword ? (
                        <EyeOff size={18} className="text-neutral-500 dark:text-neutral-400" />
                      ) : (
                        <Eye size={18} className="text-neutral-500 dark:text-neutral-400" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  className="bg-indigo-600 dark:bg-indigo-500 py-3 rounded-lg items-center mb-4"
                  onPress={handleSubmit}
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-medium">
                    {isLogin ? "Login" : "Create Account"}
                  </Text>
                </TouchableOpacity>

                {/* Toggle Login/Register */}
                <TouchableOpacity
                  onPress={toggleAuthMode}
                  className="items-center mb-6"
                  activeOpacity={0.7}
                >
                  <Text className="text-indigo-500 dark:text-indigo-400 text-sm">
                    {isLogin
                      ? "Don't have an account? Sign up"
                      : "Already have an account? Login"}
                  </Text>
                </TouchableOpacity>

                {/* Social Login Options */}
                <View className="mb-4">
                  <Text className="text-neutral-400 dark:text-neutral-300 text-xs text-center mb-4">
                    Or continue with
                  </Text>

                  <View className="flex-row justify-center space-x-4">
                    <TouchableOpacity
                      className="bg-neutral-800 dark:bg-neutral-700 p-3 rounded-lg w-[70px] items-center"
                      onPress={() => onSocialLogin("github")}
                      activeOpacity={0.7}
                    >
                      <Github size={24} className="text-white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="bg-neutral-800 dark:bg-neutral-700 p-3 rounded-lg w-[70px] items-center"
                      onPress={() => onSocialLogin("twitter")}
                      activeOpacity={0.7}
                    >
                      <Twitter size={24} className="text-white" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

export default AuthModal;
