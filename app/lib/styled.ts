// NativeWind v4 doesn't use styled() anymore
// Instead, className is passed down as a prop until it reaches a core React Native component
import { View, Text, ScrollView, TextInput, Pressable } from "react-native";

// Re-export the native components directly
export const StyledView = View;
export const StyledText = Text;
export const StyledScrollView = ScrollView;
export const StyledTextInput = TextInput;
export const StyledPressable = Pressable;

// Export native components for type safety
export type { ViewProps } from "react-native";
