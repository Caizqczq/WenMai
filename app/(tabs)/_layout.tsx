import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, View, Dimensions, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withSpring,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useTheme } from '@/components/ui/ThemeProvider';
import { COLORS, SHADOWS, SPACING, RADIUS } from '@/constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_WIDTH = SCREEN_WIDTH / 4; // 四个标签

// 自定义带动画的图标组件
interface AnimatedIconProps {
  name: any; // 简化处理Ionicons名称类型
  color: string;
  size?: number;
  focused: boolean;
  badge?: number;
}

const AnimatedIcon: React.FC<AnimatedIconProps> = ({ 
  name, 
  color, 
  size = 24, 
  focused,
  badge 
}) => {
  // 创建动画值
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);
  const translateY = useSharedValue(0);
  
  // 更新动画值
  useEffect(() => {
    if (focused) {
      scale.value = withSpring(1.2, { 
        damping: 12,
        stiffness: 120
      });
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(-8, { 
        damping: 12,
        stiffness: 150
      });
    } else {
      scale.value = withSpring(1, { 
        damping: 12,
        stiffness: 120
      });
      opacity.value = withTiming(0.7, { duration: 200 });
      translateY.value = withSpring(0, { 
        damping: 12,
        stiffness: 150
      });
    }
  }, [focused]);
  
  // 应用动画样式
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value }
      ],
      opacity: opacity.value,
    };
  });
  
  // 应用徽章动画
  const badgeAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: focused ? withTiming(1, { duration: 200 }) : withTiming(0.8, { duration: 200 }),
      transform: [
        { scale: focused ? withSpring(1.1, { damping: 12 }) : withSpring(1, { damping: 12 }) }
      ]
    };
  });
  
  // 应用标签背景动画
  const bgAnimatedStyle = useAnimatedStyle(() => {
    const bgOpacity = interpolate(
      scale.value,
      [1, 1.2],
      [0, 0.12],
      Extrapolate.CLAMP
    );
    
    return {
      opacity: bgOpacity,
      transform: [
        { scale: interpolate(
          scale.value,
          [1, 1.2],
          [0, 1],
          Extrapolate.CLAMP
        ) }
      ]
    };
  });

  return (
    <View style={styles.iconContainer}>
      {/* 图标背景 */}
      <Animated.View 
        style={[
          styles.iconBackground,
          { backgroundColor: color },
          bgAnimatedStyle
        ]} 
      />
      
      {/* 图标 */}
      <Animated.View style={animatedStyle}>
        <Ionicons name={name} size={size} color={color} />
      </Animated.View>
      
      {/* 徽章 */}
      {badge ? (
        <Animated.View style={[styles.badge, badgeAnimatedStyle]}>
          <Animated.Text style={styles.badgeText}>
            {badge > 99 ? '99+' : badge}
          </Animated.Text>
        </Animated.View>
      ) : null}
    </View>
  );
};

// 增强触感的自定义标签按钮
const EnhancedTab = ({ 
  children, 
  onPress, 
  onLongPress, 
  isFocused 
}: { 
  children: React.ReactNode, 
  onPress: () => void, 
  onLongPress: () => void,
  isFocused: boolean
}) => {
  const handlePress = () => {
    // 已移除触觉反馈
    onPress();
  };
  
  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress}
      style={styles.tab}
      android_ripple={{ color: 'rgba(0, 0, 0, 0.1)', borderless: false }}
    >
      {children}
    </Pressable>
  );
};

// 自定义底部标签栏组件
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[
      styles.tabBarContainer,
      { 
        height: Platform.OS === 'ios' ? 85 : 70,
        paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 20) : 10,
      }
    ]}>
      {/* 毛玻璃/渐变背景 */}
      {Platform.OS === 'ios' ? (
        <BlurView 
          intensity={isDark ? 40 : 60}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        <LinearGradient
          colors={isDark ? 
            ['#1E1E1E', '#121212'] : 
            ['#FFFFFF', '#F8F4EA']}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      
      {/* 顶部边线 */}
      <View 
        style={[
          styles.tabBarBorder,
          { 
            backgroundColor: isDark ? 
              'rgba(255,255,255,0.1)' : 
              'rgba(0,0,0,0.05)' 
          }
        ]} 
      />
      
      {/* 标签项 */}
      <View style={styles.tabsContainer}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.title;
          const isFocused = state.index === index;
          
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };
          
          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };
          
          // 获取图标
          const icon = options.tabBarIcon ? 
            options.tabBarIcon({ 
              focused: isFocused, 
              color: isFocused ? theme.colors.primary : theme.colors.inactive,
              size: 24
            }) : null;
          
          // 获取徽章
          const badge = options.tabBarBadge;
          
          return (
            <EnhancedTab
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              isFocused={isFocused}
            >
              <View style={styles.tabContent}>
                {icon}
                <Animated.Text 
                  style={[
                    styles.tabLabel,
                    { 
                      color: isFocused ? theme.colors.primary : theme.colors.inactive,
                      opacity: isFocused ? 1 : 0.8,
                      transform: [{ 
                        translateY: isFocused ? -4 : 0 
                      }]
                    }
                  ]}
                >
                  {label}
                </Animated.Text>
              </View>
            </EnhancedTab>
          );
        })}
      </View>
    </View>
  );
};

export default function TabLayout() {
  const { theme, isDark } = useTheme();
  
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.inactive,
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          position: 'absolute',
          elevation: 0,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 85 : 70,
        },
        tabBarBackground: () => <View style={{ flex: 1 }} />,
        tabBarIcon: ({ color, focused }) => {
          let iconName;
          
          if (route.name === 'index') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'relics') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'explore') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'collection') {
            iconName = focused ? 'scan' : 'scan-outline';
          } else if (route.name === 'profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return (
            <AnimatedIcon 
              name={iconName} 
              color={color} 
              focused={focused}
              badge={route.name === 'profile' ? 3 : undefined}
            />
          );
        },
      })}
      tabBar={props => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '文物地图',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: '探索',
        }}
      />
      <Tabs.Screen
        name="relics"
        options={{
          title: '文物库',
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: '文物识别',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'column',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    ...SHADOWS.large,
  },
  tabBarBorder: {
    position: 'absolute',
    top: 0,
    left: 15,
    right: 15,
    height: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flex: 1,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xs,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
    textAlign: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 30,
    position: 'relative',
  },
  iconBackground: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0,
    transform: [{ scale: 0 }],
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
