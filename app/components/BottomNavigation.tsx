import React, { useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Platform, 
  Animated,
  Dimensions
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Home, BookmarkIcon, Heart, User } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';

interface NavItem {
  name: string;
  href: string;
  icon: typeof Home;
}

const navItems: NavItem[] = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Library', href: '/library', icon: BookmarkIcon },
  { name: 'Favorites', href: '/favorites', icon: Heart },
  { name: 'Profile', href: '/profile', icon: User },
];

interface BottomNavigationProps {
  currentRoute?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * BottomNavigation component provides app-wide navigation
 * with home, library, favorites and profile options
 * 
 * @returns BottomNavigation component with active state indicators and animations
 */
const BottomNavigation = React.memo(function BottomNavigation({ 
  currentRoute, 
  activeTab, 
  onTabChange 
}: BottomNavigationProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const { colors, isDarkMode } = useTheme();
  
  // Use provided currentRoute or determine from pathname
  const activeRoute = currentRoute || pathname;
  
  // Animation references for tab indicators
  const tabAnimations = useRef(
    navItems.map(() => new Animated.Value(0))
  ).current;
  
  // Handle tab press with animation and haptic feedback
  const handleTabPress = useCallback((route: string, index: number) => {
    // Add haptic feedback
    try {
      const Haptics = require("expo-haptics");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available, continue silently
    }
    
    // Animate pressed tab
    Animated.sequence([
      Animated.timing(tabAnimations[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(tabAnimations[index], {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Navigate to the route
    router.push(route);
    onTabChange?.(route);
  }, [router, onTabChange, tabAnimations]);

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          shadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.2)',
        }
      ]}
    >
      {navItems.map((item, index) => {
        const isActive = activeRoute === item.href;
        const Icon = item.icon;
        
        // Scale animation for the tab
        const scale = tabAnimations[index].interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 0.9, 1],
        });
        
        return (
          <Animated.View
            key={item.name}
            style={[
              styles.tabContainer,
              {
                transform: [{ scale }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => handleTabPress(item.href, index)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityLabel={item.name}
              accessibilityState={{ selected: isActive }}
            >
              <View style={styles.tabContent}>
                <Icon
                  size={24}
                  color={isActive ? colors.primary : colors.inactive}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    { 
                      color: isActive ? colors.primary : colors.inactive, 
                      fontWeight: isActive ? '600' : '400',
                      opacity: isActive ? 1 : 0.8
                    }
                  ]}
                >
                  {item.name}
                </Text>
              </View>
              
              {isActive && (
                <Animated.View 
                  style={[
                    styles.activeIndicator, 
                    { backgroundColor: colors.primary }
                  ]} 
                />
              )}
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    flexDirection: 'row',
    elevation: 8,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 9999,
  },
  tabContainer: {
    flex: 1,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '50%',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  }
});

export default BottomNavigation;
