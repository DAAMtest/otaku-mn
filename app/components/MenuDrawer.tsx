import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { X, Settings, Moon, Sun, LogOut, Info, Heart, BookmarkIcon } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';
import Typography from './Typography';
import { useToast } from '@/context/ToastContext';

interface MenuDrawerProps {
  visible: boolean;
  onClose: () => void;
  onMenuItemPress?: (route: string) => void;
  isAuthenticated?: boolean;
  username?: string;
  avatarUrl?: string;
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  route: string;
  requiresAuth?: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 320);

/**
 * MenuDrawer component provides a slide-in menu with navigation options
 * and user profile information with animations and accessibility features
 */
const MenuDrawer = ({
  visible,
  onClose,
  onMenuItemPress,
  isAuthenticated = false,
  username = "Guest",
  avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=guest",
}: MenuDrawerProps) => {
  const router = useRouter();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { showToast } = useToast();
  
  // Animation values
  const translateX = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  
  // Track if drawer is fully hidden
  const [isFullyHidden, setIsFullyHidden] = useState(!visible);
  
  // Menu items configuration
  const menuItems: MenuItem[] = [
    {
      icon: <BookmarkIcon size={24} color={colors.text} />,
      label: 'My Library',
      route: '/library',
      requiresAuth: true,
    },
    {
      icon: <Heart size={24} color={colors.text} />,
      label: 'Favorites',
      route: '/favorites',
      requiresAuth: true,
    },
    {
      icon: <Settings size={24} color={colors.text} />,
      label: 'Settings',
      route: '/settings',
    },
    {
      icon: <Info size={24} color={colors.text} />,
      label: 'About',
      route: '/about',
    },
  ];
  
  // Handle drawer animation
  useEffect(() => {
    if (visible) {
      setIsFullyHidden(false);
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Add haptic feedback on open
      try {
        const Haptics = require("expo-haptics");
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        // Haptics not available, continue silently
      }
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Set fully hidden after animation completes
        setIsFullyHidden(true);
      });
    }
  }, [visible, translateX, backdropOpacity]);
  
  // Handle menu item press
  const handleMenuItemPress = (route: string, requiresAuth: boolean = false) => {
    // Add haptic feedback
    try {
      const Haptics = require("expo-haptics");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available, continue silently
    }
    
    if (requiresAuth && !isAuthenticated) {
      showToast('Please sign in to access this feature', 'warning');
      onClose();
      return;
    }
    
    if (onMenuItemPress) {
      onMenuItemPress(route);
    } else {
      router.push(route);
    }
    
    onClose();
  };
  
  // Handle theme toggle
  const handleThemeToggle = () => {
    // Add haptic feedback
    try {
      const Haptics = require("expo-haptics");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptics not available, continue silently
    }
    
    toggleTheme();
    showToast(`Switched to ${isDarkMode ? 'light' : 'dark'} mode`, 'info');
  };
  
  // Handle logout
  const handleLogout = () => {
    // Add haptic feedback
    try {
      const Haptics = require("expo-haptics");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // Haptics not available, continue silently
    }
    
    showToast('Logged out successfully', 'success');
    onClose();
    // Implement actual logout logic here
  };
  
  // Don't render if fully hidden
  if (isFullyHidden) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      <Animated.View 
        style={[
          styles.backdrop,
          { 
            opacity: backdropOpacity,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        ]}
      >
        <Pressable 
          style={styles.backdropPressable}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close menu"
          accessibilityHint="Closes the navigation menu"
        />
      </Animated.View>
      
      {/* Drawer Content */}
      <Animated.View 
        style={[
          styles.drawer,
          {
            backgroundColor: colors.card,
            borderRightColor: colors.border,
            transform: [{ translateX: translateX }],
          },
        ]}
        accessibilityViewIsModal={true}
        accessibilityRole="menu"
      >
        {/* Header with close button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Close menu"
          >
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: avatarUrl }} 
            style={styles.avatar}
            accessibilityIgnoresInvertColors={true}
          />
          <View style={styles.profileInfo}>
            <Typography variant="h3" style={styles.username}>
              {username}
            </Typography>
            <Typography 
              variant="bodySmall" 
              color={colors.textSecondary}
            >
              {isAuthenticated ? 'Signed In' : 'Guest User'}
            </Typography>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        {/* Menu Items */}
        <View style={styles.menuItems}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => handleMenuItemPress(item.route, item.requiresAuth)}
              accessibilityRole="menuitem"
              accessibilityLabel={item.label}
              accessibilityHint={`Navigate to ${item.label}`}
            >
              <View style={styles.menuItemIcon}>
                {item.icon}
              </View>
              <Typography variant="body" style={styles.menuItemText}>
                {item.label}
              </Typography>
            </TouchableOpacity>
          ))}
          
          {/* Theme Toggle */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleThemeToggle}
            accessibilityRole="switch"
            accessibilityLabel={`Toggle ${isDarkMode ? 'light' : 'dark'} mode`}
            accessibilityState={{ checked: isDarkMode }}
          >
            <View style={styles.menuItemIcon}>
              {isDarkMode ? (
                <Sun size={24} color={colors.text} />
              ) : (
                <Moon size={24} color={colors.text} />
              )}
            </View>
            <Typography variant="body" style={styles.menuItemText}>
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </Typography>
          </TouchableOpacity>
          
          {/* Logout Button (only shown when authenticated) */}
          {isAuthenticated && (
            <>
              <View style={styles.divider} />
              <TouchableOpacity
                style={[styles.menuItem, styles.logoutButton]}
                onPress={handleLogout}
                accessibilityRole="button"
                accessibilityLabel="Log out"
              >
                <View style={styles.menuItemIcon}>
                  <LogOut size={24} color={colors.error} />
                </View>
                <Typography 
                  variant="body" 
                  color={colors.error}
                  style={styles.menuItemText}
                >
                  Logout
                </Typography>
              </TouchableOpacity>
            </>
          )}
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Typography 
            variant="caption" 
            color={colors.textSecondary}
            align="center"
          >
            AnimeTempo v1.0.0
          </Typography>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropPressable: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: DRAWER_WIDTH,
    height: SCREEN_HEIGHT,
    borderRightWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 16,
    paddingBottom: 8,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0E0E0',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  username: {
    marginBottom: 4,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
  },
  menuItems: {
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemIcon: {
    width: 32,
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
  },
  logoutButton: {
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 34 : 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: 16,
  },
});

export default MenuDrawer;
