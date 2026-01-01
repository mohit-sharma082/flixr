import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <SafeAreaProvider>
            <SafeAreaView
                style={{
                    flex: 1,
                    backgroundColor: isDark
                        ? DarkTheme.colors.background
                        : DefaultTheme.colors.background,
                }}
                mode='padding'
                edges={['top']}>
                <Tabs
                    screenOptions={{
                        tabBarActiveTintColor:
                            Colors[colorScheme ?? 'light'].tint,
                        headerShown: false,
                        // headerBackButtonDisplayMode: 'minimal',
                        tabBarButton: HapticTab,
                        animation: 'shift',
                        tabBarVisibilityAnimationConfig: {
                            hide: {
                                animation: 'spring',
                                config: {
                                    delay: 100,
                                    stiffness: 1000,
                                    damping: 500,
                                    mass: 3,
                                    overshootClamping: true,
                                    restDisplacementThreshold: 0.01,
                                    restSpeedThreshold: 0.01,
                                },
                            },
                            show: {
                                animation: 'spring',
                                config: {
                                    delay: 100,
                                    stiffness: 1000,
                                    damping: 500,
                                    mass: 3,
                                    overshootClamping: true,
                                    restDisplacementThreshold: 0.01,
                                    restSpeedThreshold: 0.01,
                                },
                            },
                        },
                    }}>
                    <Tabs.Screen
                        name='index'
                        options={{
                            title: 'Home',
                            tabBarIcon: ({ color }) => (
                                <IconSymbol
                                    size={20}
                                    name='home'
                                    color={color}
                                />
                            ),
                        }}
                    />
                    <Tabs.Screen
                        name='explore'
                        options={{
                            title: 'Explore',
                            tabBarIcon: ({ color }) => (
                                <IconSymbol
                                    size={20}
                                    name='compass'
                                    color={color}
                                />
                            ),
                        }}
                    />
                    <Tabs.Screen
                        name='profile'
                        options={{
                            title: 'Profile',
                            tabBarIcon: ({ color, focused, size }) => (
                                <IconSymbol
                                    size={20}
                                    name='user'
                                    color={color}
                                />
                            ),
                        }}
                    />
                </Tabs>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}
