import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import BottomNavigation from "@/components/BottomNavigation";

export default function AnimeLayout() {
  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: "#171717",
          },
        }}
      >
        <Stack.Screen name="[id]" />
      </Stack>
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#171717",
  },
});
