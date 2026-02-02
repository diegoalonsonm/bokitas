import { Stack } from 'expo-router';
import { colors } from '@/lib/constants';

export default function HomeSearchLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="home" />
      <Stack.Screen name="search" />
      <Stack.Screen name="map" />
      <Stack.Screen 
        name="restaurant/[id]" 
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen 
        name="review/[id]"
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen 
        name="user/[id]"
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}
