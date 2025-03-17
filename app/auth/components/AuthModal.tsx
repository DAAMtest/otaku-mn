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
  Alert,
} from "react-native";
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

interface AuthModalProps {
  visible?: boolean;
  onClose?: () => void;
}

const AuthModal = ({
  visible = false,
  onClose = () => {},
}: AuthModalProps) => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      if (isLogin) {
        if (!email.trim()) {
          Alert.alert("Error", "Please enter your email");
          return;
        }
        if (!password) {
          Alert.alert("Error", "Please enter your password");
          return;
        }
        
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
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
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
          },
        });
        if (error) throw error;
        Alert.alert(
          "Success",
          "Registration successful! Please check your email to verify your account."
        );
      }
      
      onClose();
      router.replace('/(tabs)');
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Error", "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
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
          <View className="w-[350px] bg-gray-900 rounded-xl p-6 shadow-lg">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-xl font-bold">
                {isLogin ? "Login" : "Create Account"}
              </Text>
              <TouchableOpacity onPress={onClose} className="p-1">
                <Feather name="x" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View className="items-center mb-6">
              <Image
                source={require("../../../assets/images/icon.png")}
                className="w-20 h-20 rounded-full"
                resizeMode="contain"
              />
              <Text className="text-white text-lg font-bold mt-2">
                AnimetempO
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                {!isLogin && (
                  <View className="mb-4">
                    <Text className="text-gray-300 mb-1 text-sm">Username</Text>
                    <View className="bg-gray-800 rounded-lg px-3 py-2 flex-row items-center">
                      <Feather name="user" size={18} color="#9CA3AF" />
                      <TextInput
                        className="flex-1 text-white ml-2"
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
                    <Feather name="mail" size={18} color="#9CA3AF" />
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
                    <Feather name="lock" size={18} color="#9CA3AF" />
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
                      <Feather 
                        name={showPassword ? "eye-off" : "eye"} 
                        size={18} 
                        color="#9CA3AF" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  className={`bg-indigo-600 rounded-lg py-3 items-center mb-4 ${
                    loading ? 'opacity-70' : ''
                  }`}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  <Text className="text-white font-bold">
                    {loading 
                      ? (isLogin ? "Signing in..." : "Creating Account...") 
                      : (isLogin ? "Sign In" : "Create Account")
                    }
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="items-center mb-6"
                  onPress={toggleAuthMode}
                >
                  <Text className="text-indigo-400">
                    {isLogin
                      ? "Don't have an account? Sign up"
                      : "Already have an account? Sign in"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AuthModal;
