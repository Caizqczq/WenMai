/**
 * 文化应用的色彩系统 - 基于中国传统色彩与现代设计美学
 * 全新优化版色彩定义，提供更具文化气息的视觉体验
 */

import { Platform } from 'react-native';

// 主色调
export const COLORS = {
  // 品牌主色 - 优化为更具文化气息的赭石色
  primary: '#BC6C25',
  primaryLight: '#D68C47',
  primaryDark: '#9A5420',
  
  // 背景色 - 优化为更温润的宣纸色
  background: '#F9F6F0',
  backgroundLight: '#FFFDF7',
  backgroundDark: '#EAE6D9',
  
  // 文字颜色 - 调整为墨色系
  text: '#1F1F1F',
  textSecondary: '#3C3C3C',
  textLight: '#666666',
  
  // 功能色 - 基于传统颜料色系
  success: '#5E8B60', // 松绿
  warning: '#E6B422', // 赤金
  error: '#B33B3B',   // 朱砂
  info: '#4C6BA0',    // 靛青
  
  // 辅助色 - 传统文物色系
  accent1: '#C19A6B', // 琉璃黄（青铜色）
  accent2: '#547980', // 铜绿
  accent3: '#7FA074', // 青瓷色
  accent4: '#9D5C63', // 紫檀
  accent5: '#846852', // 驼色（丝绸）
  
  // 新增 - 传统文化配色
  cinnabar: '#CF5B45',     // 朱砂
  rusha: '#954535',        // 褐锈
  azurite: '#567BAE',      // 石青
  verdantGreen: '#2A8E78', // 翠绿
  turmeric: '#E2B13C',     // 姜黄
  ochre: '#D2AA6D',        // 赭石
  malachite: '#1F766B',    // 孔雀石绿
  
  // 新增 - 渐变色系统
  gradients: {
    bronze: ['#D2AA6D', '#A67C52'],
    jade: ['#7DB290', '#4A8C70'],
    porcelain: ['#94B9D6', '#5A92C4'],
    silk: ['#E8C4A2', '#C8A887'],
    calligraphy: ['#565656', '#232323'],
  },
  
  // 其他UI元素
  border: '#E2DED6',
  divider: '#EEEAE0',
  card: '#FFFFFF',
  cardHighlight: '#FFFBF0',
  shadow: 'rgba(60, 40, 20, 0.08)',
  overlay: 'rgba(35, 35, 35, 0.65)',
  
  // 状态色
  active: '#BC6C25',
  inactive: '#AAAAAA',
  focus: '#D68C47',
  
  // 通用
  white: '#FFFFFF',
  black: '#1F1F1F',
  transparent: 'transparent',
  
  // 文物类型颜色
  bronzeType: '#C19A6B',   // 青铜器
  ceramicType: '#7FA074',  // 陶瓷器
  paintingType: '#9D5C63', // 书画
  textileType: '#846852',  // 丝织品
  jadeType: '#739894',     // 玉器
};

// 定义字体
export const FONTS = {
  // 字体族 - 增加更多适合中文展示的字体
  family: {
    main: Platform.OS === 'ios' ? 'PingFang SC' : 'Noto Sans SC',
    heading: Platform.OS === 'ios' ? 'PingFang SC' : 'Noto Serif SC',
    special: Platform.OS === 'ios' ? 'STKaiti' : 'Noto Serif SC',
    mono: Platform.OS === 'ios' ? 'Menlo' : 'Roboto Mono',
  },
  
  // 字重
  weight: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
  
  // 字号 - 调整为黄金比例(1.618)递增
  size: {
    xs: 10,
    small: 12,
    medium: 14,
    large: 16,
    xl: 19,
    xxl: 23,
    xxxl: 28,
    title: 34,
    headline: 42,
  },
  
  // 行高 - 优化中文阅读体验
  lineHeight: {
    tight: 1.3,   // 紧凑(标题)
    normal: 1.5,  // 正常(正文)
    relaxed: 1.8, // 宽松(长文本)
  },
  
  // 字间距
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};

// 间距系统 - 优化为8点网格系统
export const SPACING = {
  xxs: 2,
  xs: 4,
  small: 8,
  medium: 16,
  large: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// 圆角 - 优化视觉协调性
export const RADIUS = {
  xs: 2,
  small: 4,
  medium: 8,
  large: 12,
  xl: 20,
  xxl: 28,
  round: 999,
};

// 阴影 - 优化为更自然的纸感投影效果
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 8,
  },
  float: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 16,
  },
};

// 动画时间 - 增加更丰富的动画持续时间选项
export const ANIMATION = {
  veryFast: 100,
  fast: 150,
  normal: 250,
  slow: 400,
  verySlow: 600,
  curve: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
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
