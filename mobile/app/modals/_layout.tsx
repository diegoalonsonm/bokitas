import { Stack } from 'expo-router';
import { colors } from '@/lib/constants';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_bottom',
      }}
    >
      <Stack.Screen name="create-review" />
      <Stack.Screen name="filter" />
    </Stack>
  );
}
