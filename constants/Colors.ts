/**
 * 文化应用的颜色系统 - 基于中国传统色彩与现代设计美学
 * 优化版颜色定义，提供更丰富的视觉体验
 */

import { Platform } from 'react-native';

// 主色调
export const COLORS = {
  // 品牌主色 - 优化为更温润的赤金色
  primary: '#9C5333',
  primaryLight: '#B87A5C',
  primaryDark: '#7A3E23',
  
  // 背景色 - 优化为更柔和的宣纸色
  background: '#F9F6F0',
  backgroundLight: '#FFFDF7',
  backgroundDark: '#E9E3D4',
  
  // 文字颜色 - 调整为更易读的灰度
  text: '#2C2C2C',
  textSecondary: '#555555',
  textLight: '#888888',
  
  // 功能色 - 调整为传统国画色系
  success: '#5E8B60', // 松绿
  warning: '#E6B422', // 赤金
  error: '#C14D43',   // 胭脂
  info: '#4C6BA0',    // 靛青
  
  // 辅助色 - 优化为传统文物色系
  accent1: '#C19A6B', // 琉璃黄（青铜色）
  accent2: '#6E7787', // 铜青（青铜绿锈色）
  accent3: '#7FA074', // 青瓷色
  accent4: '#9F6164', // 紫檀
  accent5: '#846852', // 驼色（丝绸）
  
  // 其他UI元素 - 调整为更舒适的视觉层次
  border: '#E8E2D5',
  divider: '#F0EBE0',
  card: '#FFFFFF',
  shadow: 'rgba(0, 0, 0, 0.08)',
  overlay: 'rgba(44, 44, 44, 0.6)',
  
  // 状态色
  active: '#9C5333',
  inactive: '#AAAAAA',
  
  // 通用
  white: '#FFFFFF',
  black: '#2C2C2C',
  transparent: 'transparent',
  
  // 文物类型颜色
  bronzeType: '#C19A6B',   // 青铜器
  ceramicType: '#7FA074',  // 陶瓷器
  paintingType: '#9F6164', // 书画
  textileType: '#846852',  // 丝织品
  jadeType: '#739894',     // 玉器
};

// 定义字体
export const FONTS = {
  // 字体族 - 优化字体选择
  family: {
    main: Platform.OS === 'ios' ? 'PingFang SC' : 'sans-serif',
    heading: Platform.OS === 'ios' ? 'PingFang SC' : 'sans-serif-medium',
    special: Platform.OS === 'ios' ? 'STKaiti' : 'serif',
    mono: 'SpaceMono',
  },
  
  // 字重
  weight: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
  
  // 字号 - 调整为更合理的比例
  size: {
    xs: 10,
    small: 12,
    medium: 14,
    large: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    title: 28,
    headline: 32,
  },
  
  // 行高
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
};

// 间距系统 - 优化为更一致的比例
export const SPACING = {
  xs: 4,
  small: 8,
  medium: 16,
  large: 24,
  xl: 32,
  xxl: 48,
};

// 圆角 - 优化视觉协调性
export const RADIUS = {
  small: 4,
  medium: 8,
  large: 12,
  xl: 20,
  round: 999,
};

// 阴影 - 优化为更自然的投影效果
export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 6,
  },
};

// 动画时间
export const ANIMATION = {
  fast: 150,
  normal: 250,
  slow: 400,
};

// 主题
const tintColorLight = COLORS.primary;
const tintColorDark = COLORS.primaryLight;

export default {
  light: {
    text: COLORS.text,
    background: COLORS.background,
    tint: tintColorLight,
    tabIconDefault: COLORS.inactive,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: COLORS.white,
    background: '#1C1C1E',
    tint: tintColorDark,
    tabIconDefault: '#AAAAAA',
    tabIconSelected: tintColorDark,
  },
};
