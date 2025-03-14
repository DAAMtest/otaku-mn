import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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

interface AuthModalProps {
  visible?: boolean;
  onClose?: () => void;
  onLogin?: (email: string, password: string) => void;
  onRegister?: (email: string, password: string, username: string) => void;
  onSocialLogin?: (provider: string) => void;
}

const AuthModal = ({
  visible = false,
  onClose = () => {},
  onLogin = () => {},
  onRegister = () => {},
  onSocialLogin = () => {},
}: AuthModalProps) => {
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
    // Reset fields when switching modes
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
          <View className="w-[350px] bg-gray-900 rounded-xl p-6 shadow-lg">
            {/* Header with close button */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-xl font-bold">
                {isLogin ? "Login" : "Create Account"}
              </Text>
              <TouchableOpacity onPress={onClose} className="p-1">
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Logo */}
            <View className="items-center mb-6">
              <Image
                source={require("../../assets/images/icon.png")}
                className="w-20 h-20 rounded-full"
                resizeMode="contain"
              />
              <Text className="text-white text-lg font-bold mt-2">
                Otaku Mongolia
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Form Fields */}
              <View className="mb-4">
                {!isLogin && (
                  <View className="mb-4">
                    <Text className="text-gray-300 mb-1 text-sm">Username</Text>
                    <View className="bg-gray-800 rounded-lg px-3 py-2 flex-row items-center">
                      <TextInput
                        className="flex-1 text-white"
                        placeholder="Enter your username"
                        placeholderTextColor="#6B7280"
                        value={username}
                        onChangeText={setUsername}
                      />
                    </View>
                  </View>
                )}

                <View className="mb-4">
                  <Text className="text-gray-300 mb-1 text-sm">Email</Text>
                  <View className="bg-gray-800 rounded-lg px-3 py-2 flex-row items-center">
                    <Mail size={18} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 text-white ml-2"
                      placeholder="Enter your email"
                      placeholderTextColor="#6B7280"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                </View>

                <View className="mb-6">
                  <Text className="text-gray-300 mb-1 text-sm">Password</Text>
                  <View className="bg-gray-800 rounded-lg px-3 py-2 flex-row items-center">
                    <Lock size={18} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 text-white ml-2"
                      placeholder="Enter your password"
                      placeholderTextColor="#6B7280"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff size={18} color="#9CA3AF" />
                      ) : (
                        <Eye size={18} color="#9CA3AF" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  className="bg-blue-600 rounded-lg py-3 items-center mb-4"
                  onPress={handleSubmit}
                >
                  <Text className="text-white font-bold">
                    {isLogin ? "Login" : "Create Account"}
                  </Text>
                </TouchableOpacity>

                {/* Toggle Login/Register */}
                <TouchableOpacity
                  className="items-center mb-6"
                  onPress={toggleAuthMode}
                >
                  <Text className="text-blue-400">
                    {isLogin
                      ? "Don't have an account? Sign up"
                      : "Already have an account? Login"}
                  </Text>
                </TouchableOpacity>

                {/* Divider */}
                <View className="flex-row items-center mb-6">
                  <View className="flex-1 h-[1px] bg-gray-700" />
                  <Text className="text-gray-400 mx-4">OR</Text>
                  <View className="flex-1 h-[1px] bg-gray-700" />
                </View>

                {/* Social Login Options */}
                <View className="flex-row justify-center space-x-4 mb-2">
                  <TouchableOpacity
                    className="bg-gray-800 w-12 h-12 rounded-full items-center justify-center"
                    onPress={() => onSocialLogin("google")}
                  >
                    <Image
                      source={{
                        uri: "https://api.dicebear.com/7.x/avataaars/svg?seed=google",
                      }}
                      className="w-6 h-6"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-gray-800 w-12 h-12 rounded-full items-center justify-center"
                    onPress={() => onSocialLogin("github")}
                  >
                    <Github size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-gray-800 w-12 h-12 rounded-full items-center justify-center"
                    onPress={() => onSocialLogin("twitter")}
                  >
                    <Twitter size={24} color="#1DA1F2" />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AuthModal;
