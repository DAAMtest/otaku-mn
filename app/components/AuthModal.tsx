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
  TextInput,
} from "react-native";
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Github,
  Twitter,
  User,
  AlertCircle,
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
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    username?: string;
  }>({});

  const handleSubmit = () => {
    // Reset errors
    setErrors({});
    let newErrors: { email?: string; password?: string; username?: string } =
      {};
    let hasErrors = false;

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
      hasErrors = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
      hasErrors = true;
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
      hasErrors = true;
    } else if (!isLogin && password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      hasErrors = true;
    }

    // Username validation for registration
    if (!isLogin && !username.trim()) {
      newErrors.username = "Username is required";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    // Proceed with authentication
    if (isLogin) {
      onLogin(email, password);
    } else {
      onRegister(email, password, username);
    }

    // Add haptic feedback on submit
    try {
      const Haptics = require("expo-haptics");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // Haptics not available, continue silently
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
    setUsername("");
    setErrors({});

    // Add haptic feedback on mode toggle
    try {
      const Haptics = require("expo-haptics");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available, continue silently
    }
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
                <X
                  size={18}
                  className="text-neutral-400 dark:text-neutral-300"
                />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Form Fields */}
              <View className="mb-4">
                {!isLogin && (
                  <View className="mb-4">
                    <Text className="text-neutral-400 dark:text-neutral-300 text-sm mb-2">
                      Username
                    </Text>
                    <View
                      className={`flex-row items-center border ${errors.username ? "border-red-500" : "border-neutral-800 dark:border-neutral-700"} rounded-lg px-3 py-2 bg-neutral-900 dark:bg-neutral-800`}
                    >
                      <User
                        size={18}
                        className="text-neutral-500 dark:text-neutral-400"
                      />
                      <TextInput
                        className="flex-1 ml-2 text-neutral-100 dark:text-white"
                        placeholder="Your username"
                        placeholderTextColor="#6B7280"
                        value={username}
                        onChangeText={(text) => {
                          setUsername(text);
                          if (errors.username) {
                            setErrors({ ...errors, username: undefined });
                          }
                        }}
                        autoCapitalize="none"
                      />
                    </View>
                    {errors.username && (
                      <View className="flex-row items-center mt-1">
                        <AlertCircle size={12} color="#EF4444" />
                        <Text className="text-red-500 text-xs ml-1">
                          {errors.username}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                <View className="mb-4">
                  <Text className="text-neutral-400 dark:text-neutral-300 text-sm mb-2">
                    Email
                  </Text>
                  <View
                    className={`flex-row items-center border ${errors.email ? "border-red-500" : "border-neutral-800 dark:border-neutral-700"} rounded-lg px-3 py-2 bg-neutral-900 dark:bg-neutral-800`}
                  >
                    <Mail
                      size={18}
                      className="text-neutral-500 dark:text-neutral-400"
                    />
                    <TextInput
                      className="flex-1 ml-2 text-neutral-100 dark:text-white"
                      placeholder="your.email@example.com"
                      placeholderTextColor="#6B7280"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (errors.email) {
                          setErrors({ ...errors, email: undefined });
                        }
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                  </View>
                  {errors.email && (
                    <View className="flex-row items-center mt-1">
                      <AlertCircle size={12} color="#EF4444" />
                      <Text className="text-red-500 text-xs ml-1">
                        {errors.email}
                      </Text>
                    </View>
                  )}
                </View>

                <View className="mb-6">
                  <Text className="text-neutral-400 dark:text-neutral-300 text-sm mb-2">
                    Password
                  </Text>
                  <View
                    className={`flex-row items-center border ${errors.password ? "border-red-500" : "border-neutral-800 dark:border-neutral-700"} rounded-lg px-3 py-2 bg-neutral-900 dark:bg-neutral-800`}
                  >
                    <Lock
                      size={18}
                      className="text-neutral-500 dark:text-neutral-400"
                    />
                    <TextInput
                      className="flex-1 ml-2 text-neutral-100 dark:text-white"
                      placeholder="Your password"
                      placeholderTextColor="#6B7280"
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (errors.password) {
                          setErrors({ ...errors, password: undefined });
                        }
                      }}
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      {showPassword ? (
                        <EyeOff
                          size={18}
                          className="text-neutral-500 dark:text-neutral-400"
                        />
                      ) : (
                        <Eye
                          size={18}
                          className="text-neutral-500 dark:text-neutral-400"
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                  {errors.password && (
                    <View className="flex-row items-center mt-1">
                      <AlertCircle size={12} color="#EF4444" />
                      <Text className="text-red-500 text-xs ml-1">
                        {errors.password}
                      </Text>
                    </View>
                  )}
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
