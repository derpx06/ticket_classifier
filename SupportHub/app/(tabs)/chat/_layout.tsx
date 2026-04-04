import { Stack, useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { Font } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ChatLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTitleStyle: {
          fontFamily: Font.semibold,
          fontSize: 17,
          color: colors.text,
        },
        headerTitleAlign: 'left',
        headerTintColor: colors.text,
        headerShadowVisible: false,
        animation: 'default',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          title: 'Conversation',
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.55 : 1 }]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={12}
            >
              <Feather name="arrow-left" size={24} color={colors.text} />
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    paddingLeft: Spacing.sm,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.xs,
  },
});
