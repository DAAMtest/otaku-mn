import React, { useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated, 
  TouchableOpacity, 
  Dimensions,
  AccessibilityInfo,
  Platform
} from 'react-native';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';
import Typography from './Typography';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
  enableHaptics?: boolean;
}

const { width } = Dimensions.get('window');

/**
 * Toast notification component for providing user feedback
 * Supports different types: success, error, info, warning
 * Includes haptic feedback and accessibility features
 */
export default function Toast({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onClose,
  enableHaptics = true,
}: ToastProps) {
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  // Get toast colors based on type
  const getToastColors = () => {
    switch (type) {
      case 'success':
        return {
          background: colors.success,
          icon: <CheckCircle size={20} color="#FFFFFF" />,
        };
      case 'error':
        return {
          background: colors.error,
          icon: <AlertCircle size={20} color="#FFFFFF" />,
        };
      case 'warning':
        return {
          background: colors.warning,
          icon: <AlertTriangle size={20} color="#FFFFFF" />,
        };
      case 'info':
      default:
        return {
          background: colors.info,
          icon: <Info size={20} color="#FFFFFF" />,
        };
    }
  };
  
  const { background, icon } = getToastColors();
  
  // Get accessibility announcement based on toast type
  const getAccessibilityAnnouncement = () => {
    const prefix = type === 'success' ? 'Success' : 
                  type === 'error' ? 'Error' : 
                  type === 'warning' ? 'Warning' : 'Information';
    return `${prefix}: ${message}`;
  };
  
  // Handle toast animation
  useEffect(() => {
    let hideTimeout: NodeJS.Timeout;
    
    if (visible) {
      // Show toast animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Provide haptic feedback based on toast type
      if (enableHaptics) {
        try {
          const Haptics = require('expo-haptics');
          switch (type) {
            case 'success':
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              break;
            case 'error':
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              break;
            case 'warning':
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              break;
            case 'info':
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              break;
          }
        } catch (error) {
          // Haptics not available, continue silently
        }
      }
      
      // Announce toast message for screen readers
      AccessibilityInfo.announceForAccessibility(getAccessibilityAnnouncement());
      
      // Auto hide after duration
      hideTimeout = setTimeout(() => {
        hideToast();
      }, duration);
    }
    
    return () => {
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  }, [visible, duration, type, message]);
  
  // Hide toast animation
  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };
  
  if (!visible) return null;
  
  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <View 
        style={[
          styles.toast,
          { backgroundColor: background },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer} accessibilityElementsHidden={true}>
            {icon}
          </View>
          <View style={styles.messageContainer}>
            <Typography 
              variant="bodySmall" 
              color="#FFFFFF"
              numberOfLines={2}
            >
              {message}
            </Typography>
          </View>
          <TouchableOpacity
            onPress={hideToast}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Close notification"
            accessibilityHint="Dismisses the current notification"
          >
            <X size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  toast: {
    width: width - 32,
    maxWidth: 500,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  iconContainer: {
    marginRight: 12,
  },
  messageContainer: {
    flex: 1,
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
});
