/**
 * NativeWind v4 setup file
 * This file is used to configure NativeWind for the application
 * 
 * NativeWind v4 no longer uses the styled() function.
 * Instead, components can use className directly.
 */

// Re-export React Native components to maintain backward compatibility
// with existing imports in the codebase
export {
  Text,
  View,
  Image,
  TextInput,
  ScrollView,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

// Export a helper function to inform users about the NativeWind v4 changes
export const createStyledComponent = (Component: any) => {
  console.warn(
    'NativeWind v4 no longer uses styled() function. Use className prop directly on components instead.'
  );
  return Component;
};

// For backward compatibility
export const styled = createStyledComponent;

// NativeWind: This file is used for NativeWind v4 setup
