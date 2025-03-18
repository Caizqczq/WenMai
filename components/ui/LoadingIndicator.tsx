import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  Animated,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { COLORS, FONTS, SPACING, ANIMATION } from '../../constants/Colors';

interface LoadingIndicatorProps {
  size?: 'small' | 'medium' | 'large';
  type?: 'default' | 'page' | 'overlay' | 'inline' | 'button';
  color?: string;
  message?: string;
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  delay?: number; // 延迟显示时间（毫秒）
  showBackground?: boolean;
  duration?: number; // 动画持续时间
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'medium',
  type = 'default',
  color = COLORS.primary,
  message,
  isLoading = true,
  style,
  textStyle,
  delay = 300,
  showBackground = true,
  duration = ANIMATION.normal,
}) => {
  // 获取指示器大小
  const getIndicatorSize = (): 'small' | 'large' => {
    switch (size) {
      case 'small': return 'small';
      case 'large': return 'large';
      default: return 'small';
    }
  };

  // 获取容器样式
  const getContainerStyle = (): StyleProp<ViewStyle> => {
    switch (type) {
      case 'page':
        return styles.pageContainer;
      case 'overlay':
        return styles.overlayContainer;
      case 'inline':
        return styles.inlineContainer;
      case 'button':
        return styles.buttonContainer;
      default:
        return styles.defaultContainer;
    }
  };

  // 控制动画的值
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // 创建一个延迟显示的定时器
    let delayTimer: NodeJS.Timeout | null = null;
    
    if (isLoading) {
      delayTimer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
        ]).start();
      }, delay);
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: duration,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // 清理函数
    return () => {
      if (delayTimer) {
        clearTimeout(delayTimer);
      }
    };
  }, [isLoading, fadeAnim, scaleAnim, delay, duration]);

  // 如果不在加载状态且没有设置延迟，则不渲染任何内容
  if (!isLoading && delay === 0) {
    return null;
  }

  // 动画样式
  const animatedStyle = {
    opacity: fadeAnim,
    transform: [{ scale: scaleAnim }],
  };

  // 根据类型获取背景颜色
  const getBackgroundColor = (): string | null => {
    if (!showBackground) return null;
    
    switch (type) {
      case 'overlay':
        return 'rgba(0, 0, 0, 0.6)';
      case 'page':
        return COLORS.background;
      case 'button':
        return 'transparent';
      default:
        return COLORS.white;
    }
  };

  const backgroundColor = getBackgroundColor();

  return (
    <Animated.View
      style={[
        getContainerStyle(),
        backgroundColor && { backgroundColor },
        animatedStyle,
        style,
      ]}
    >
      <ActivityIndicator
        size={getIndicatorSize()}
        color={color}
        animating={isLoading}
      />
      {message && (
        <Text style={[styles.message, textStyle]}>
          {message}
        </Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  defaultContainer: {
    flexDirection: 'row',
    padding: SPACING.medium,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  pageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.small,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginLeft: SPACING.small,
    color: COLORS.text,
    fontSize: FONTS.size.medium,
    fontFamily: FONTS.family.main,
  },
});

export default LoadingIndicator; 