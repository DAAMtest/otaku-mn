import React, { useState, useEffect } from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Platform, 
  Animated, 
  StatusBar 
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Search, 
  Bell, 
  Menu as MenuIcon 
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';
import Typography from './Typography';
import { useToast } from '@/context/ToastContext';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  showNotifications?: boolean;
  showMenu?: boolean;
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  onNotificationsPress?: () => void;
  transparent?: boolean;
  scrollOffset?: Animated.Value;
}

/**
 * Header component provides navigation and action buttons
 * with support for animations and accessibility
 */
const Header = ({
  title = "AnimeTempo",
  showBack = false,
  showSearch = false,
  showNotifications = false,
  showMenu = false,
  onMenuPress,
  onSearchPress,
  onNotificationsPress,
  transparent = false,
  scrollOffset,
}: HeaderProps) => {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const { showToast } = useToast();
  const [opacity] = useState(new Animated.Value(transparent ? 0 : 1));
  
  // Handle scroll-based header opacity
  useEffect(() => {
    if (scrollOffset && transparent) {
      scrollOffset.addListener(({ value }) => {
        const headerOpacity = Math.min(value / 100, 1);
        opacity.setValue(headerOpacity);
      });
      
      return () => {
        scrollOffset.removeAllListeners();
      };
    }
  }, [scrollOffset, transparent, opacity]);
  
  // Calculate dynamic header styles
  const headerBackgroundColor = transparent 
    ? opacity.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(0,0,0,0)', colors.card],
      })
    : colors.card;
  
  const headerShadowOpacity = transparent
    ? opacity.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.1],
      })
    : 0.1;
  
  // Handle button press with haptic feedback
  const handleButtonPress = (action: () => void) => {
    // Add haptic feedback
    try {
      const Haptics = require("expo-haptics");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available, continue silently
    }
    
    action();
  };
  
  // Handle back button press
  const handleBackPress = () => {
    handleButtonPress(() => {
      router.back();
    });
  };
  
  // Handle search button press
  const handleSearchPress = () => {
    handleButtonPress(() => {
      if (onSearchPress) {
        onSearchPress();
      } else {
        router.push('/search');
      }
    });
  };
  
  // Handle notifications button press
  const handleNotificationsPress = () => {
    handleButtonPress(() => {
      if (onNotificationsPress) {
        onNotificationsPress();
      } else {
        showToast('Notifications coming soon!', 'info');
      }
    });
  };
  
  // Handle menu button press
  const handleMenuPress = () => {
    handleButtonPress(() => {
      if (onMenuPress) {
        onMenuPress();
      }
    });
  };

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: headerBackgroundColor,
            shadowOpacity: headerShadowOpacity,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.leftContainer}>
          {showBack && (
            <TouchableOpacity
              onPress={handleBackPress}
              style={styles.iconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          )}
          
          <Typography 
            variant="h2" 
            numberOfLines={1} 
            style={styles.title}
          >
            {title}
          </Typography>
        </View>
        
        <View style={styles.rightContainer}>
          {showSearch && (
            <TouchableOpacity
              onPress={handleSearchPress}
              style={styles.iconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Search"
            >
              <Search size={24} color={colors.text} />
            </TouchableOpacity>
          )}
          
          {showNotifications && (
            <TouchableOpacity
              onPress={handleNotificationsPress}
              style={styles.iconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
            >
              <Bell size={24} color={colors.text} />
            </TouchableOpacity>
          )}
          
          {showMenu && (
            <TouchableOpacity
              onPress={handleMenuPress}
              style={styles.iconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Menu"
            >
              <MenuIcon size={24} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </>
  );
};

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: STATUSBAR_HEIGHT + 8,
    paddingBottom: 8,
    paddingHorizontal: 16,
    height: STATUSBAR_HEIGHT + 56,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
    zIndex: 100,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    marginLeft: 8,
    flex: 1,
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 20,
  },
});

export default Header;
