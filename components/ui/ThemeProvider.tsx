import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useColorScheme, Appearance, AppState, AppStateStatus } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  Easing,
  interpolateColor
} from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS, ANIMATION } from '../../constants/Colors';

// 主题接口定义
interface Theme {
  colors: typeof COLORS & {
    // 暗色模式特有的颜色
    cardDark?: string;
    borderDark?: string;
  };
  fonts: typeof FONTS;
  spacing: typeof SPACING;
  radius: typeof RADIUS;
  shadows: typeof SHADOWS;
  animation: typeof ANIMATION;
}

// 主题上下文
interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (mode: 'light' | 'dark' | 'system') => void;
  themeAnimProgress: Animated.SharedValue<number>;
}

// 创建主题上下文
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 主题提供者属性
interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: 'light' | 'dark' | 'system';
}

/**
 * 主题提供者组件 - 提供统一的主题管理
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  initialTheme = 'system' 
}) => {
  // 获取系统颜色模式
  const systemColorScheme = useColorScheme();
  
  // 动画进度值 (0: 亮色, 1: 暗色)
  const themeAnimProgress = useSharedValue(
    initialTheme === 'dark' || (initialTheme === 'system' && systemColorScheme === 'dark') ? 1 : 0
  );
  
  // 确定初始主题模式
  const getInitialMode = (): boolean => {
    if (initialTheme === 'system') {
      return systemColorScheme === 'dark';
    }
    return initialTheme === 'dark';
  };
  
  // 主题状态
  const [isDark, setIsDark] = useState(getInitialMode());
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(initialTheme);
  
  // 监听系统主题变化
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (themeMode === 'system') {
        const newIsDark = colorScheme === 'dark';
        setIsDark(newIsDark);
        // 动画过渡到新主题
        themeAnimProgress.value = withTiming(
          newIsDark ? 1 : 0, 
          { 
            duration: 350,
            easing: Easing.bezier(0.2, 0.65, 0.4, 0.9)
          }
        );
      }
    });
    
    // 监听应用状态变化（前台/后台）
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && themeMode === 'system') {
        const colorScheme = Appearance.getColorScheme();
        const newIsDark = colorScheme === 'dark';
        if (newIsDark !== isDark) {
          setIsDark(newIsDark);
          themeAnimProgress.value = withTiming(
            newIsDark ? 1 : 0, 
            { 
              duration: 350,
              easing: Easing.bezier(0.2, 0.65, 0.4, 0.9)
            }
          );
        }
      }
    };
    
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
      appStateSubscription.remove();
    };
  }, [themeMode, isDark]);
  
  // 切换主题
  const toggleTheme = () => {
    setIsDark(!isDark);
    setThemeMode(isDark ? 'light' : 'dark');
    // 动画过渡
    themeAnimProgress.value = withTiming(
      isDark ? 0 : 1, 
      { 
        duration: 350,
        easing: Easing.bezier(0.2, 0.65, 0.4, 0.9)
      }
    );
  };
  
  // 设置特定主题
  const setTheme = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    if (mode === 'system') {
      const newIsDark = systemColorScheme === 'dark';
      setIsDark(newIsDark);
      themeAnimProgress.value = withTiming(
        newIsDark ? 1 : 0, 
        { 
          duration: 350,
          easing: Easing.bezier(0.2, 0.65, 0.4, 0.9)
        }
      );
    } else {
      setIsDark(mode === 'dark');
      themeAnimProgress.value = withTiming(
        mode === 'dark' ? 1 : 0, 
        { 
          duration: 350,
          easing: Easing.bezier(0.2, 0.65, 0.4, 0.9)
        }
      );
    }
  };
  
  // 亮色主题
  const lightTheme: Theme = {
    colors: COLORS,
    fonts: FONTS,
    spacing: SPACING,
    radius: RADIUS,
    shadows: SHADOWS,
    animation: ANIMATION,
  };
  
  // 暗色主题 (优化暗色模式体验)
  const darkTheme: Theme = {
    colors: {
      ...COLORS,
      // 重写暗色模式的颜色
      background: '#121212',
      backgroundLight: '#1E1E1E',
      backgroundDark: '#0A0A0A',
      text: '#F3F3F3',
      textSecondary: '#CCCCCC',
      textLight: '#999999',
      card: '#1F1F1F',
      cardDark: '#171717',
      border: '#2C2C2E',
      borderDark: '#3C3C3E',
      divider: '#333333',
      shadow: 'rgba(0, 0, 0, 0.25)',
      overlay: 'rgba(10, 10, 10, 0.8)',
      
      // 优化暗色模式的状态色
      primary: '#D68C47', // 更亮的主色调
      primaryLight: '#E8A76B',
      primaryDark: '#B06C27',
      
      // 优化暗色模式的功能色
      success: '#7BA97D',
      warning: '#EECA5E',
      error: '#D35D5D',
      info: '#6D90C7',
      
      // 优化暗色模式的辅助色
      accent1: '#D4AD7B',
      accent2: '#70A0A7',
      accent3: '#8FB285',
      accent4: '#C17B82',
      accent5: '#A28668',
    },
    fonts: FONTS,
    spacing: SPACING,
    radius: RADIUS,
    shadows: {
      ...SHADOWS,
      small: {
        ...SHADOWS.small,
        shadowColor: '#000',
        shadowOpacity: 0.3,
      },
      medium: {
        ...SHADOWS.medium,
        shadowColor: '#000',
        shadowOpacity: 0.35,
      },
      large: {
        ...SHADOWS.large,
        shadowColor: '#000',
        shadowOpacity: 0.4,
      }
    },
    animation: ANIMATION,
  };
  
  // 当前主题
  const theme = isDark ? darkTheme : lightTheme;
  
  // 提供主题上下文
  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme, themeAnimProgress }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * 使用主题的钩子
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

/**
 * 创建支持主题的组件
 * @param Component 需要支持主题的组件
 */
export function withTheme<P extends {}>(
  Component: React.ComponentType<P & { theme: Theme }>
): React.FC<P> {
  return (props: P) => {
    const { theme } = useTheme();
    return <Component {...props} theme={theme} />;
  };
}

/**
 * 创建一个可以使用动画值的主题颜色
 * @param lightColor 亮色模式的颜色
 * @param darkColor 暗色模式的颜色
 */
export function useAnimatedThemeColor(lightColor: string, darkColor: string) {
  const { themeAnimProgress } = useTheme();
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(
        themeAnimProgress.value,
        [0, 1],
        [lightColor, darkColor]
      ),
    };
  });
  
  return animatedStyle;
}

/**
 * 创建一个可以使用动画值的主题背景色
 * @param lightColor 亮色模式的背景色
 * @param darkColor 暗色模式的背景色
 */
export function useAnimatedThemeBackground(lightColor: string, darkColor: string) {
  const { themeAnimProgress } = useTheme();
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        themeAnimProgress.value,
        [0, 1],
        [lightColor, darkColor]
      ),
    };
  });
  
  return animatedStyle;
} 