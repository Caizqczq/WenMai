// UI组件导出文件
// 导出所有UI组件以便统一使用

import Button from './Button';
import Card from './Card';
import LoadingIndicator from './LoadingIndicator';
import PageTransition from './PageTransition';
import Skeleton, { 
  AvatarSkeleton, 
  CardSkeleton, 
  ListItemSkeleton, 
  RelicDetailSkeleton, 
  StoryExperienceSkeleton, 
  TextSkeleton 
} from './Skeleton';
import { ThemeProvider, useTheme, withTheme } from './ThemeProvider';

// 导出所有UI组件
export {
  // 按钮组件
  Button,
  
  // 卡片组件
  Card,
  
  // 加载指示器
  LoadingIndicator,
  
  // 页面过渡动画
  PageTransition,
  
  // 骨架屏组件
  Skeleton,
  AvatarSkeleton,
  CardSkeleton,
  ListItemSkeleton,
  RelicDetailSkeleton,
  StoryExperienceSkeleton,
  TextSkeleton,
  
  // 主题组件
  ThemeProvider,
  useTheme,
  withTheme
};

// 统一组件主题
export const UI = {
  Button,
  Card,
  LoadingIndicator,
  PageTransition,
  Skeleton,
  AvatarSkeleton,
  CardSkeleton,
  ListItemSkeleton,
  RelicDetailSkeleton,
  StoryExperienceSkeleton,
  TextSkeleton,
  ThemeProvider,
  useTheme,
  withTheme
};

// 导出图标组件
export { IconSymbol } from './IconSymbol';
export { default as TabBarBackground } from './TabBarBackground'; 