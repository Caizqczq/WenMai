import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS, ANIMATION } from '../../constants/Colors';

// 主题接口定义
interface Theme {
  colors: typeof COLORS;
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
  const colorScheme = useColorScheme();
  
  // 确定初始主题模式
  const getInitialMode = (): boolean => {
    if (initialTheme === 'system') {
      return colorScheme === 'dark';
    }
    return initialTheme === 'dark';
  };
  
  // 主题状态
  const [isDark, setIsDark] = useState(getInitialMode());
  
  // 切换主题
  const toggleTheme = () => {
    setIsDark(!isDark);
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
  
  // 暗色主题 (未来可以基于COLORS定义暗色变体)
  const darkTheme: Theme = {
    colors: {
      ...COLORS,
      // 重写暗色模式的颜色
      background: '#121212',
      backgroundLight: '#1E1E1E',
      backgroundDark: '#0A0A0A',
      text: '#FFFFFF',
      textSecondary: '#CCCCCC',
      textLight: '#999999',
      card: '#1C1C1E',
      border: '#2C2C2E',
      divider: '#333333',
    },
    fonts: FONTS,
    spacing: SPACING,
    radius: RADIUS,
    shadows: SHADOWS,
    animation: ANIMATION,
  };
  
  // 当前主题
  const theme = isDark ? darkTheme : lightTheme;
  
  // 提供主题上下文
  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
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