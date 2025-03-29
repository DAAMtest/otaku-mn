import React, { useState, useEffect } from "react";
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
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useTheme } from "@/context/ThemeProvider";

interface AuthModalProps {
  visible?: boolean;
  onClose?: () => void;
  onLogin?: (email: string, password: string) => Promise<void>;
  onRegister?: (email: string, password: string, username: string) => void;
  onSocialLogin?: (provider: string) => void;
  initialMode?: 'login' | 'register';
}

const AuthModal = ({
  visible = false,
  onClose = () => {},
  onLogin,
  onRegister,
  onSocialLogin,
  initialMode = 'login',
}: AuthModalProps) => {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Update mode if initialMode prop changes
  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

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

        if (error) {
          Alert.alert("Error", error.message);
          return;
        }

        if (onLogin) {
          await onLogin(email, password);
        }
        onClose();
        router.replace('/(tabs)');
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
        
        // Simplify the signUp call to avoid TypeScript errors
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          Alert.alert("Error", error.message);
          return;
        }

        // Note: Username will be handled through profile creation after signup
        console.log("User signed up successfully with email:", email);
        Alert.alert(
          "Success",
          "Registration successful! Please check your email to verify your account."
        );
        if (onRegister) {
          onRegister(email, password, username);
        }
        onClose();
      }
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
        style={styles.container}
      >
        <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[
            styles.modalContent, 
            { 
              backgroundColor: isDarkMode ? colors.card : '#FFFFFF',
              borderColor: colors.border
            }
          ]}>
            <View style={styles.header}>
              <Text style={[styles.headerText, { color: colors.text }]}>
                {isLogin ? "Sign In" : "Create Account"}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.logoContainer}>
              <Image
                source={require("../../../assets/images/icon.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={[styles.appName, { color: colors.text }]}>
                AnimetempO
              </Text>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.formContainer}>
                {!isLogin && (
                  <View style={styles.inputContainer}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Username</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                      <Feather name="user" size={18} color={colors.textSecondary} />
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Enter your username"
                        placeholderTextColor={colors.textSecondary}
                        value={username}
                        onChangeText={setUsername}
                      />
                    </View>
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                    <Feather name="mail" size={18} color={colors.textSecondary} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Enter your email"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Password</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                    <Feather name="lock" size={18} color={colors.textSecondary} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Enter your password"
                      placeholderTextColor={colors.textSecondary}
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Feather 
                        name={showPassword ? "eye-off" : "eye"} 
                        size={18} 
                        color={colors.textSecondary} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    { backgroundColor: colors.primary },
                    loading && styles.disabledButton
                  ]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {isLogin ? "Sign In" : "Create Account"}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.toggleModeButton}
                  onPress={toggleAuthMode}
                >
                  <Text style={[styles.toggleModeText, { color: colors.primary }]}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  overlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 350,
    maxHeight: '80%',
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  toggleModeButton: {
    alignItems: 'center',
    marginBottom: 8,
  },
  toggleModeText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AuthModal;
