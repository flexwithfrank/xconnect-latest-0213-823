import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase, ensureProfile } from '../lib/supabase';

export default function RootLayout() {
  const [session, setSession] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(!!session);
      if (session) {
        ensureProfile().then(profile => {
          if (!profile) {
            supabase.auth.signOut();
            setSession(false);
          }
        });
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(!!session);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#0d0d0c' }}>
        <Stack screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: '#0d0d0c' },
          animation: 'slide_from_right',
          animationDuration: 200,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          fullScreenGestureEnabled: true,
        }}>
          {session ? (
            <>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen 
                name="create-post"
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                  gestureEnabled: true,
                  gestureDirection: 'vertical',
                }}
              />
              <Stack.Screen 
                name="post/[id]"
                options={{
                  animation: 'slide_from_right',
                  gestureEnabled: true,
                  gestureDirection: 'horizontal',
                }}
              />
              <Stack.Screen 
                name="promotions"
                options={{
                  animation: 'slide_from_right',
                  gestureEnabled: true,
                  gestureDirection: 'horizontal',
                }}
              />
            </>
          ) : (
            <Stack.Screen name="auth" />
          )}
        </Stack>
        <StatusBar style="light" />
      </View>
    </SafeAreaProvider>
  );
}