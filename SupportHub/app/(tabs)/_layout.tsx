import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { Colors, Spacing } from '@/constants/theme';
import { Font } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';

const TAB_ICON_SIZE = 24;

type IonName = keyof typeof Ionicons.glyphMap;

function TabBarIcon({
  outline,
  solid,
  color,
  focused,
}: {
  outline: IonName;
  solid: IonName;
  color: string;
  focused: boolean;
}) {
  return (
    <View style={styles.tabIconWrap}>
      <Ionicons name={focused ? solid : outline} size={TAB_ICON_SIZE} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { signOut } = useAuth();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const tabPadBottom = Math.max(insets.bottom, Spacing.sm);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
          elevation: 0,
        },
        headerTitleStyle: {
          fontFamily: Font.semibold,
          fontSize: 17,
          color: colors.text,
        },
        headerTitleAlign: 'left',
        headerTintColor: colors.text,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          paddingTop: Spacing.sm,
          paddingBottom: tabPadBottom,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontFamily: Font.medium,
          fontSize: 10,
          marginTop: 2,
          letterSpacing: 0.2,
        },
        tabBarItemStyle: {
          paddingTop: 6,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
        headerRight: () => (
          <Pressable
            onPress={signOut}
            style={({ pressed }) => [
              styles.headerIconBtn,
              { opacity: pressed ? 0.55 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            <Feather name="log-out" size={20} color={colors.icon} />
          </Pressable>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          headerShown: false,
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon outline="home-outline" solid="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="queries"
        options={{
          title: 'Queries',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              outline="file-tray-stacked-outline"
              solid="file-tray-stacked"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              outline="chatbubbles-outline"
              solid="chatbubbles"
              color={color}
              focused={focused}
            />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('chat', { screen: 'index' } as never);
          },
        })}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: TAB_ICON_SIZE + 2,
  },
  headerIconBtn: {
    marginRight: Spacing.lg,
    padding: Spacing.sm,
  },
});
