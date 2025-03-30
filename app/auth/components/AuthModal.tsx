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
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from "@/context/ThemeProvider";
import { useAuth } from "@/context/AuthContext";
import * as SecureStore from 'expo-secure-store';

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
  const { signIn, signUp, refreshSession } = useAuth();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  // Log the current pathname to debug
  useEffect(() => {
    console.log('AuthModal - Current pathname:', pathname);
  }, [pathname]);

  // Update mode if initialMode prop changes
  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

  // Reset form and state when modal visibility changes
  useEffect(() => {
    if (visible) {
      console.log('AuthModal - Modal became visible, resetting form');
    } else {
      // Reset form when modal closes
      setEmail("");
      setPassword("");
      setUsername("");
    }
  }, [visible]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      if (isLogin) {
        if (!email.trim()) {
          Alert.alert("Error", "Please enter your email");
          setLoading(false);
          return;
        }
        if (!password) {
          Alert.alert("Error", "Please enter your password");
          setLoading(false);
          return;
        }
        
        try {
          // Use AuthContext's signIn
          const session = await signIn(email, password);
          console.log("AuthModal - Login successful");
          
          // Call onLogin callback if provided
          if (onLogin) {
            try {
              await onLogin(email, password);
            } catch (error) {
              console.error("Error in onLogin callback", error);
            }
          }
          
          // Reset form fields and close modal
          setEmail("");
          setPassword("");
          onClose();
          
          // Verify session and navigate
          const isValid = await refreshSession();
          if (isValid) {
            console.log("AuthModal - Session verified, navigating to library");
            router.push('/library');
          } else {
            console.error("AuthModal - Session verification failed");
            Alert.alert("Error", "Failed to verify session. Please try again.");
          }
        } catch (error: any) {
          console.error("AuthModal - Login error:", error);
          Alert.alert("Error", error.message || "Failed to sign in");
        }
      } else {
        // Registration logic
        if (!username.trim()) {
          Alert.alert("Error", "Please enter a username");
          setLoading(false);
          return;
        }
        if (!email.trim()) {
          Alert.alert("Error", "Please enter your email");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          Alert.alert("Error", "Password must be at least 6 characters");
          setLoading(false);
          return;
        }
        
        try {
          // Use AuthContext's signUp
          const session = await signUp(email, password);
          
          if (session) {
            // Create user profile
            const { error: profileError } = await supabase
              .from('users')
              .insert({
                id: session.user.id,
                username,
                avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });

            if (profileError) {
              console.error("Error creating user profile:", profileError);
            }

            Alert.alert(
              "Success",
              "Registration successful! You can now use the app."
            );
            
            // Call onRegister callback if provided
            if (onRegister) {
              try {
                onRegister(email, password, username);
              } catch (error) {
                console.error("Error in onRegister callback", error);
              }
            }
            
            // Reset form fields
            setEmail("");
            setPassword("");
            setUsername("");
            
            // Close modal first
            onClose();
            
            // Verify session and navigate
            const isValid = await refreshSession();
            if (isValid) {
              console.log("AuthModal - Session verified after registration, navigating to library");
              router.push('/library');
            } else {
              console.error("AuthModal - Session verification failed after registration");
              Alert.alert("Error", "Failed to verify session. Please try signing in.");
            }
          }
        } catch (error: any) {
          console.error("AuthModal - Registration error:", error);
          Alert.alert("Error", error.message || "Failed to create account");
        }
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

  // Custom close handler to prevent navigation
  const handleClose = () => {
    console.log("AuthModal - Closing modal, staying on path:", pathname);
    
    // Reset form fields
    setEmail("");
    setPassword("");
    setUsername("");
    
    // Force a session refresh
    refreshSession();
    
    // Close the modal
    onClose();
  };

  if (!visible) return null;

  // If we're on a mobile device and inside a tab, render a fullscreen modal
  const isInTab = pathname?.includes('/(tabs)');

  return (
    <Modal
      visible={visible}
      transparent={!isInTab}
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent={isInTab}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, isInTab && styles.fullScreen]}
      >
        <View style={[
          styles.overlay, 
          { backgroundColor: isInTab ? (isDarkMode ? '#0F172A' : '#FFFFFF') : 'rgba(0,0,0,0.5)' }
        ]}>
          <View style={[
            styles.modalContent, 
            isInTab && styles.fullScreenContent,
            { 
              backgroundColor: isDarkMode ? colors.card : '#FFFFFF',
              borderColor: colors.border
            }
          ]}>
            <View style={styles.header}>
              <Text style={[styles.headerText, { color: colors.text }]}>
                {isLogin ? "Sign In" : "Create Account"}
              </Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
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
  fullScreen: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  fullScreenContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
  },
});

export default AuthModal;
