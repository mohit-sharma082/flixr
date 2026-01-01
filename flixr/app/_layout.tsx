import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export const unstable_settings = {
    anchor: '(tabs)',
};

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
            <StatusBar style={isDark ? 'light' : 'dark'} translucent />
            <Stack
                screenOptions={{
                    animation: 'slide_from_left',
                    animationDuration: 1000,
                    statusBarAnimation: 'slide',
                    headerShown: false,
                }}>
                <Stack.Screen
                    name='(tabs)'
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name='modal'
                    options={{ presentation: 'modal', title: 'Modal' }}
                />
            </Stack>
        </ThemeProvider>
    );
}
