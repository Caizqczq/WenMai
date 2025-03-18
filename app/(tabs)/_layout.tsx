import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

// 自定义带动画的图标组件
interface AnimatedIconProps {
  name: any; // 简化处理Ionicons名称类型
  color: string;
  size?: number;
  focused: boolean;
}

const AnimatedIcon: React.FC<AnimatedIconProps> = ({ name, color, size = 24, focused }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { 
          scale: withTiming(focused ? 1.2 : 1, { 
            duration: 200 
          }) 
        }
      ],
      opacity: withTiming(focused ? 1 : 0.7, { duration: 200 }),
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  // 根据配色设定主题颜色
  const primaryColor = '#8B4513';
  const backgroundColor = '#F8F4EA';
  
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: '#9E9E9E',
        headerShown: false,
        tabBarButton: (props) => <HapticTab {...props} />,
        tabBarBackground: () => <View style={{ backgroundColor }} />,
        tabBarStyle: {
          backgroundColor: backgroundColor,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          height: Platform.OS === 'ios' ? 85 : 70,
          paddingTop: 5,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
        tabBarLabelStyle: {
          fontFamily: Platform.OS === 'ios' ? 'PingFang SC' : 'sans-serif-medium',
          fontSize: 12,
          fontWeight: '500',
        },
      })}>
      <Tabs.Screen
        name="index"
        options={{
          title: '文物地图',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon name="map-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="relics"
        options={{
          title: '文物库',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon name="cube-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: '文物识别',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon name="scan-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon name="person-outline" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
