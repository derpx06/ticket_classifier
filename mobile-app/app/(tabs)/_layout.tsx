import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { Pressable, Text } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useSession } from '@/context/session-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, logout } = useSession();

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarButton: HapticTab,
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerRight: () => (
          <Pressable onPress={logout} style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={{ color: '#1d4ed8', fontWeight: '700' }}>Logout</Text>
          </Pressable>
        ),
      }}>
      <Tabs.Screen
        name="queries"
        options={{
          title: 'Queries',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
