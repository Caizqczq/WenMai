import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#8B4513',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            backgroundColor: '#F5EFE0',
          },
          android: {
            backgroundColor: '#F5EFE0',
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '地图',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>🗺️</Text>,
        }}
      />
      <Tabs.Screen
        name="relics"
        options={{
          title: '文物库',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>🏺</Text>,
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: '识别',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>🔍</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
