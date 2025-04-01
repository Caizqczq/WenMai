import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useColorScheme, View, StyleSheet, Text, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { COLORS, FONTS } from '../constants/Colors';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import { ThemeProvider } from '../components/ui/ThemeProvider';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const colorScheme = useColorScheme();

  // 只加载本地字体文件，不加载系统字体
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // 延迟显示主应用，给加载器一些时间展示
      const timer = setTimeout(() => {
        setIsReady(true);
        SplashScreen.hideAsync();
      }, 1000); // 1秒延迟
      
      return () => clearTimeout(timer);
    }
  }, [loaded]);

  if (!loaded || !isReady) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingIndicator 
          size="large"
          type="page"
          message="正在加载文化应用..." 
          color={COLORS.primary} 
        />
      </View>
    );
  }

  return <RootLayoutNav colorScheme={colorScheme || 'light'} />;
}

function RootLayoutNav({ colorScheme }: { colorScheme: 'light' | 'dark' }) {
  // 创建一个自定义主题，基于原始主题但使用我们的颜色
  const customLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: COLORS.primary,
      background: COLORS.background,
      card: COLORS.card,
      text: COLORS.text,
      border: COLORS.border,
    },
  };
  
  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: COLORS.primaryLight,
      card: '#1C1C1E',
      background: '#121212',
    },
  };

  // 选择当前主题
  const theme = colorScheme === 'dark' ? customDarkTheme : customLightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationThemeProvider value={theme}>
        <ThemeProvider initialTheme={colorScheme}>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.colors.background },
              animation: 'slide_from_right',
              presentation: 'card',
              gestureEnabled: true,
              animationDuration: 300,
              // 自定义卡片过渡动画：移除cardStyleInterpolator，改用更简单的配置
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="relic/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="region/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="story/[id]" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="map" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
          </Stack>
        </ThemeProvider>
      </NavigationThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
});
