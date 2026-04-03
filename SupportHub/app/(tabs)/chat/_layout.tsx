import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Font } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ChatLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Stack
      screenOptions={{
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
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Messages' }} />
      <Stack.Screen name="[id]" options={{ title: 'Conversation' }} />
    </Stack>
  );
}
