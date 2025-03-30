import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { usePathname } from 'expo-router';

export default function TabsLayout() {
  const { session, isLoading } = useAuth();
  const pathname = usePathname();
  
  // Debug logging for tab navigation
  useEffect(() => {
    console.log('Tabs layout - Auth state:', { 
      sessionExists: !!session, 
      isLoading,
      currentPath: pathname
    });
  }, [session, isLoading, pathname]);
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e5e7eb',
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
